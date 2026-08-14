import { http } from './http';
import { env } from '../../config/env';
import { CharacterQuery, MetricResult, tokenize } from './types';

type DanbooruTag = { name: string; post_count: number; category: number };

const CHARACTER_CATEGORY = 4;

const searchTags = async (pattern: string): Promise<DanbooruTag[]> => {
  const response = await http.get('https://danbooru.donmai.us/tags.json', {
    params: {
      'search[name_matches]': pattern,
      'search[category]': CHARACTER_CATEGORY,
      'search[order]': 'count',
      limit: 20,
    },
    headers: env.danbooruToken ? { Authorization: `Bearer ${env.danbooruToken}` } : undefined,
  });

  return Array.isArray(response.data) ? response.data : [];
};

/**
 * How confident we are that a tag is this character, rather than someone whose
 * name merely shares a word.
 *
 * Matching on the full name does not work: Danbooru writes `surname_given`, and
 * its romanisation often differs from AniList's (`todoroki_shoto` against
 * "Shouto Todoroki"). So the search is by single token and the filtering
 * happens here, where the franchise is the tie-breaker that stops "Xiao" from
 * resolving to Yang Xiao Long.
 */
const scoreTag = (tag: DanbooruTag, nameTokens: string[], franchiseTokens: string[]) => {
  const tagTokens = tokenize(tag.name.replace(/_/g, ' '));
  const hasAllNameTokens = nameTokens.every((token) => tagTokens.includes(token));
  const hasFranchise = franchiseTokens.some((token) => tagTokens.includes(token));

  let score = 0;
  if (hasAllNameTokens) score += 3;
  if (hasFranchise) score += 3;
  // A single-token name matching a single-token tag is a plausible exact hit.
  if (nameTokens.length === 1 && tagTokens.length === 1 && tagTokens[0] === nameTokens[0]) score += 2;
  return score;
};

export const fetchDanbooruMetric = async (query: CharacterQuery): Promise<MetricResult> => {
  const franchiseTokens = query.franchiseHints.flatMap(tokenize);
  const terms = [query.name, ...query.aliases];

  const candidates = new Map<string, { tag: DanbooruTag; score: number }>();

  for (const term of terms) {
    const nameTokens = tokenize(term);
    if (!nameTokens.length) continue;

    // Search on the longest token: it is the most distinctive, and Danbooru's
    // word order will not match the source catalogue's.
    const probe = [...nameTokens].sort((a, b) => b.length - a.length)[0];

    let tags: DanbooruTag[];
    try {
      tags = await searchTags(`*${probe}*`);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      console.warn(`[danbooru] Lookup failed for "${term}"${status ? ` (${status})` : ''}`);
      return { source: 'danbooru', value: null };
    }

    tags.forEach((tag) => {
      if (!tag.post_count) return;
      const score = scoreTag(tag, nameTokens, franchiseTokens);
      if (score <= 0) return;
      const existing = candidates.get(tag.name);
      if (!existing || score > existing.score) candidates.set(tag.name, { tag, score });
    });

    // A franchise-confirmed match is as good as this gets; stop paying for more.
    if ([...candidates.values()].some((candidate) => candidate.score >= 6)) break;
  }

  if (!candidates.size) return { source: 'danbooru', value: null };

  const best = [...candidates.values()].sort(
    (a, b) => b.score - a.score || b.tag.post_count - a.tag.post_count,
  )[0];

  return { source: 'danbooru', value: best.tag.post_count, raw: best.tag.name };
};
