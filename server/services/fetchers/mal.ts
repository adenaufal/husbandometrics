import { createPacer, http } from './http';
import { CharacterQuery, MetricResult } from './types';

/** Jikan allows roughly 3 requests per second and answers 429 above that. */
const paced = createPacer(400);

/**
 * MyAnimeList favourites, read through Jikan (no API key required).
 *
 * Jikan proxies MAL, so it returns 504 whenever MAL itself refuses the
 * connection. That surfaces as a null reading rather than a zero - the
 * character has not suddenly lost their favourites.
 */
export const fetchMalMetric = async (query: CharacterQuery): Promise<MetricResult> => {
  for (const term of [query.name, ...query.aliases]) {
    try {
      const response = await paced(() =>
        http.get('https://api.jikan.moe/v4/characters', {
          params: { q: term, limit: 5, order_by: 'favorites', sort: 'desc' },
        }),
      );

      const results: Array<{ name?: string; favorites?: number }> = response.data?.data ?? [];
      const best = results.find((entry) => Number.isFinite(entry.favorites));
      if (best?.favorites) {
        return { source: 'mal', value: best.favorites, raw: best };
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      console.warn(`[mal] Lookup failed for "${term}"${status ? ` (${status})` : ''}`);
      // A transport failure will repeat for the aliases too, so stop early.
      break;
    }
  }

  return { source: 'mal', value: null };
};
