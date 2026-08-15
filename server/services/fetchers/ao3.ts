import { createPacer, http } from './http';
import * as cheerio from 'cheerio';
import { env } from '../../config/env';
import { CharacterQuery, MetricResult, tokenize } from './types';

/**
 * AO3 answers `Accept: application/json` with a 302 to a page that then 404s.
 * Axios sends that Accept header by default, so both calls have to override it.
 */
const AO3_HEADERS = { Accept: '*/*' };

/**
 * AO3 throttles hard and its search pages time out under load. One retry turns
 * most of those into a reading; without it a whole character silently loses
 * their AO3 figure to a transient blip.
 */
const RETRY_DELAYS_MS = [2000, 5000, 9000];

/** AO3 throttles anonymous clients hard; a full refresh makes ~80 calls here. */
const paced = createPacer(1200);

const withRetry = async <T>(request: () => Promise<T>): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      // A 404 is a real answer about this tag; anything else - throttling, a
      // gateway blip, a timeout - is worth another try. Without the backoff,
      // two to five characters lost their AO3 figure on every full refresh.
      if (status === 404) throw error;
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      }
    }
  }

  throw lastError;
};

/**
 * The result count lives in the only `.heading` that reads "N Found" - the
 * first heading on the page is the literal text "Search Results".
 */
const parseResultCount = (html: string) => {
  const $ = cheerio.load(html);
  for (const text of $('.heading')
    .toArray()
    .map((element) => $(element).text())) {
    const match = text.match(/(?<count>[\d,]+)\s+Found/i);
    if (match?.groups?.count) return Number(match.groups.count.replace(/,/g, ''));
  }
  return null;
};

/**
 * AO3's canonical character tag, e.g. `Zhongli (Genshin Impact)`.
 *
 * Free-text search is not usable as a metric: `work_search[query]=Xiao` returns
 * 103,000 works, because it matches the substring anywhere in any field. The
 * character tag returns the works actually about them.
 */
const resolveCharacterTag = async (query: CharacterQuery): Promise<string | null> => {
  const franchiseTokens = query.franchiseHints.flatMap(tokenize);
  const scored: Array<{ tag: string; score: number }> = [];

  for (const term of [query.name, ...query.aliases]) {
    const nameTokens = tokenize(term);
    if (!nameTokens.length) continue;

    // The /character endpoint returns character tags only. The generic /tag one
    // also returns freeform tags, where "Levi Ackerman is Mikasa Ackerman's
    // Uncle" (62 works) outranked the real character tag.
    const response = await withRetry(() =>
      paced(() =>
        http.get('https://archiveofourown.org/autocomplete/character', {
          params: { term },
          headers: AO3_HEADERS,
        }),
      ),
    );
    const suggestions: string[] = (response.data ?? []).map((entry: { name: string }) => entry.name);

    suggestions
      // `/` is a romantic pairing and `&` a platonic one; both count works for
      // two characters, so neither measures this character alone.
      .filter((tag) => !tag.includes('/') && !tag.includes('&'))
      .forEach((tag) => {
        const tagTokens = tokenize(tag);
        // The name is a hard requirement; the rest only ranks.
        if (!nameTokens.every((token) => tagTokens.includes(token))) return;

        const hasFranchise = franchiseTokens.some((token) => tagTokens.includes(token));
        // Every word that is neither the name nor the fandom narrows the tag to
        // something other than the character: "Bakugou Katsuki's Dragon (My Hero
        // Academia: Fantasy Setting)" carries the name and the fandom, yet has
        // 23 works against the real tag's 200,000.
        const extraTokens = tagTokens.filter(
          (token) => !nameTokens.includes(token) && !franchiseTokens.includes(token),
        ).length;

        scored.push({ tag, score: (hasFranchise ? 3 : 0) - extraTokens });
      });

    if (scored.some((entry) => entry.score >= 3)) break;
  }

  if (!scored.length) return null;
  return scored.sort((a, b) => b.score - a.score)[0].tag;
};

const countWorks = async (tag: string) => {
  // /works is the generic index and ignores work_search - only /works/search
  // actually runs the query.
  const response = await withRetry(() =>
    paced(() =>
      http.get(`${env.ao3BaseUrl}/works/search`, {
        params: { 'work_search[character_names]': tag },
        headers: AO3_HEADERS,
      }),
    ),
  );

  return parseResultCount(response.data);
};

export const fetchAo3Metric = async (query: CharacterQuery): Promise<MetricResult> => {
  try {
    // A remembered tag skips the lookup entirely. If it has gone stale the
    // count comes back empty, and the fall-through re-resolves it once.
    if (query.knownTag) {
      const cached = await countWorks(query.knownTag);
      if (Number.isFinite(cached)) return { source: 'ao3', value: cached, raw: query.knownTag };
    }

    const tag = await resolveCharacterTag(query);
    if (!tag) return { source: 'ao3', value: null };

    const count = await countWorks(tag);
    return Number.isFinite(count)
      ? { source: 'ao3', value: count, raw: tag }
      : { source: 'ao3', value: null };
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    console.warn(`[ao3] Lookup failed for "${query.name}"${status ? ` (${status})` : ''}`);
    return { source: 'ao3', value: null };
  }
};
