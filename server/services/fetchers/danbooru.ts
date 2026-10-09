import { createPacer, http } from './http';
import { env } from '../../config/env';
import { CharacterQuery, MetricResult, plainWords } from './types';
import { aliasNames, compareFits, fitTag, spellings, type TagFit } from './tagMatch';

type DanbooruTag = { name: string; post_count: number; category: number };

type Candidate = { name: string; count: number; fit: TagFit };

const CHARACTER_CATEGORY = 4;

/** Alias searches a resolve may spend once the name itself has come up empty. */
const MAX_ALIAS_PATTERNS = 8;

/** A cold resolve searches several patterns per character; keep them spaced. */
const paced = createPacer(250);

const headers = () => (env.danbooruToken ? { Authorization: `Bearer ${env.danbooruToken}` } : undefined);

const searchTags = async (pattern: string): Promise<DanbooruTag[]> => {
  const response = await paced(() =>
    http.get('https://danbooru.donmai.us/tags.json', {
      params: {
        'search[name_matches]': pattern,
        'search[category]': CHARACTER_CATEGORY,
        'search[order]': 'count',
        // A busy word buries the character under other people's tags:
        // `*musashi*` lists a dozen Fate costumes before Vagabond's Musashi.
        limit: 100,
      },
      headers: headers(),
    }),
  );

  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Direct count for a tag we already know, skipping the candidate search.
 *
 * Danbooru follows its own aliases here, which is what makes a name it keeps
 * only as an alias worth remembering: `lelouch_lamperouge` has no posts of its
 * own and counts the 3,228 of `lelouch_vi_britannia`.
 */
const countPosts = async (tag: string) => {
  const response = await paced(() =>
    http.get('https://danbooru.donmai.us/counts/posts.json', {
      params: { tags: tag },
      headers: headers(),
    }),
  );

  const count = response.data?.counts?.posts;
  return Number.isFinite(count) ? (count as number) : null;
};

/**
 * Patterns for the character's own name, most telling first.
 *
 * Danbooru writes `surname_given` in its own romanisation, so a name is searched
 * by its words: the two longest together in either order, which is usually the
 * tag itself, then each alone - `*todoroki*` finds `todoroki_shoto` where
 * "Shouto Todoroki" would not. A one-word name is searched under a qualifier
 * first: `ray_(yakusoku_no_neverland)` is one of hundreds of tags containing
 * "ray", and `l_(death_note)` has no other word to search on.
 */
const namePatterns = (name: string) => {
  const all = plainWords(name);
  const long = [...new Set(all.filter((word) => word.length > 2))].sort((a, b) => b.length - a.length);

  const qualified = long.length > 1 ? [] : all.map((word) => `${word}_(*`);
  const paired = long.length > 1 ? [`*${long[0]}*${long[1]}*`, `*${long[1]}*${long[0]}*`] : [];
  return [...qualified, ...paired, ...long.map((word) => `*${word}*`)];
};

/** An alias by its longest word; a one-word alias under a qualifier too: `twilight_(spy_x_family)`. */
const aliasPatterns = (alias: string) => {
  const long = plainWords(alias)
    .filter((word) => word.length > 2)
    .sort((a, b) => b.length - a.length);
  if (!long.length) return [];
  return long.length === 1 ? [`${long[0]}_(*`, `*${long[0]}*`] : [`*${long[0]}*`];
};

/** Best fit first, then the busier tag. */
const byFit = (a: Candidate, b: Candidate) => compareFits(a.fit, b.fit) || b.count - a.count;

/**
 * The character's tag, judged by `fitTag`.
 *
 * The matcher before this ranked candidates by post count once they contained
 * a name, so the busiest tag that shared a word won: Jing Yuan read as Jingliu,
 * a different character, and Zoro as `zolo`, 16 posts of something else.
 */
export const resolveDanbooruTag = async (
  query: CharacterQuery,
): Promise<{ name: string; count: number } | null> => {
  const found: Candidate[] = [];
  // Names that fit but carry no posts: either Danbooru aliases, which count
  // their target, or dead tags. Only a count tells them apart.
  const pending: Candidate[] = [];
  const seen = new Set<string>();
  const best = () => [...found].sort(byFit)[0];

  const collect = (tags: DanbooruTag[]) =>
    tags.forEach((tag) => {
      if (seen.has(tag.name)) return;
      seen.add(tag.name);
      const fit = fitTag(query, tag.name);
      if (!fit) return;
      (tag.post_count > 0 ? found : pending).push({ name: tag.name, count: tag.post_count, fit });
    });

  // Count the alias-only names that would beat what was found outright.
  const settlePending = async () => {
    for (const candidate of pending.splice(0).sort(byFit).slice(0, 3)) {
      const current = best();
      if (current && compareFits(current.fit, candidate.fit) <= 0) break;
      const count = await countPosts(candidate.name);
      if (count) found.push({ ...candidate, count });
    }
  };

  for (const pattern of new Set(spellings(query.name).flatMap(namePatterns))) {
    collect(await searchTags(pattern));
    if (best()?.fit.rank === 3) break;
  }
  await settlePending();

  // Aliases only when the name found nothing better than an alias would.
  if ((best()?.fit.rank ?? 0) < 2) {
    const patterns = [...new Set(aliasNames(query.aliases).flatMap(aliasPatterns))];
    for (const pattern of patterns.slice(0, MAX_ALIAS_PATTERNS)) {
      collect(await searchTags(pattern));
      if ((best()?.fit.rank ?? 0) >= 2) break;
    }
    await settlePending();
  }

  const chosen = best();
  return chosen ? { name: chosen.name, count: chosen.count } : null;
};

export const fetchDanbooruMetric = async (query: CharacterQuery): Promise<MetricResult> => {
  // A remembered tag is one request instead of a search per alias. A stale one
  // counts zero, and the fall-through re-resolves it.
  if (query.knownTag) {
    try {
      const cached = await countPosts(query.knownTag);
      if (cached) return { source: 'danbooru', value: cached, raw: query.knownTag };
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      console.warn(`[danbooru] Cached tag lookup failed for "${query.knownTag}"${status ? ` (${status})` : ''}`);
    }
  }

  try {
    const tag = await resolveDanbooruTag(query);
    return tag
      ? { source: 'danbooru', value: tag.count, raw: tag.name }
      : { source: 'danbooru', value: null };
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    console.warn(`[danbooru] Lookup failed for "${query.name}"${status ? ` (${status})` : ''}`);
    return { source: 'danbooru', value: null };
  }
};
