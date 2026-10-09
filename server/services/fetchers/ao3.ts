import { createPacer, http } from "./http";
import * as cheerio from "cheerio";
import { env } from "../../config/env";
import { CharacterQuery, MetricResult } from "./types";
import {
  aliasNames,
  compareFits,
  fitTag,
  sharedElsewhere,
  spellings,
  type TagFit,
} from "./tagMatch";

/**
 * AO3 answers `Accept: application/json` with a 302 to a page that then 404s.
 * Axios sends that Accept header by default, so both calls have to override it.
 */
const AO3_HEADERS = { Accept: "*/*" };

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
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      // A 404 is a real answer about this tag; anything else - throttling, a
      // gateway blip, a timeout - is worth another try. Without the backoff,
      // two to five characters lost their AO3 figure on every full refresh.
      if (status === 404) throw error;
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS_MS[attempt]),
        );
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
  for (const text of $(".heading")
    .toArray()
    .map((element) => $(element).text())) {
    const match = text.match(/(?<count>[\d,]+)\s+Found/i);
    if (match?.groups?.count)
      return Number(match.groups.count.replace(/,/g, ""));
  }
  return null;
};

/**
 * Autocomplete requests a resolve may spend. Each is a paced call against the
 * slowest source, and past the name and its first few aliases the rest are
 * nicknames that only ever surface someone else's tag.
 */
const MAX_TERMS = 8;

/**
 * AO3's canonical character tag, e.g. `Zhongli (Genshin Impact)`.
 *
 * Free-text search is not usable as a metric: `work_search[query]=Xiao` returns
 * 103,000 works, because it matches the substring anywhere in any field. The
 * character tag returns the works actually about them.
 *
 * The autocomplete answers with every tag that shares a word with the term -
 * "Thorfinn Karlsefni" brings back an 11th-century explorer, Harry Potter's
 * Thorfinn Rowle and a sitcom ghost before Vinland Saga's Thorfinn - so which
 * suggestion is the character is `fitTag`'s call, not the order's.
 */
export const resolveAo3Tag = async (
  query: CharacterQuery,
): Promise<string | null> => {
  const candidates: Array<{ tag: string; fit: TagFit }> = [];
  const seen = new Set<string>();
  const terms = [
    ...new Set([...spellings(query.name), ...aliasNames(query.aliases)]),
  ];
  const ours = () =>
    candidates.filter(
      ({ tag }) => !sharedElsewhere(query, tag, [...seen]),
    );

  for (const term of terms.slice(0, MAX_TERMS)) {
    // The /character endpoint returns character tags only. The generic /tag one
    // also returns freeform tags, where "Levi Ackerman is Mikasa Ackerman's
    // Uncle" (62 works) outranked the real character tag.
    const response = await withRetry(() =>
      paced(() =>
        http.get(`${env.ao3BaseUrl}/autocomplete/character`, {
          params: { term },
          headers: AO3_HEADERS,
        }),
      ),
    );
    const suggestions: string[] = (response.data ?? []).map(
      (entry: { name: string }) => entry.name,
    );

    suggestions
      // `/` is a romantic pairing and `&` a platonic one; both count works for
      // two characters, so neither measures this character alone.
      .filter((tag) => !tag.includes("/") && !tag.includes("&"))
      .filter((tag) => !seen.has(tag))
      .forEach((tag) => {
        // Every suggestion is kept, fitting or not: the others are what
        // shows a bare name to be shared (`sharedElsewhere`).
        seen.add(tag);
        const fit = fitTag(query, tag);
        if (fit) candidates.push({ tag, fit });
      });

    // The name, or part of it under the franchise, settles it: an alias can
    // only add a weaker match.
    if (ours().some(({ fit }) => fit.rank >= 2)) break;
  }

  // The sort is stable, so between equal fits AO3's own order stands.
  return ours().sort((a, b) => compareFits(a.fit, b.fit))[0]?.tag ?? null;
};

const countWorks = async (tag: string) => {
  // /works is the generic index and ignores work_search - only /works/search
  // actually runs the query.
  const response = await withRetry(() =>
    paced(() =>
      http.get(`${env.ao3BaseUrl}/works/search`, {
        params: { "work_search[character_names]": tag },
        headers: AO3_HEADERS,
      }),
    ),
  );

  return parseResultCount(response.data);
};

export const fetchAo3Metric = async (
  query: CharacterQuery,
): Promise<MetricResult> => {
  try {
    // A remembered tag skips the lookup entirely. If it has gone stale the
    // count comes back empty, and the fall-through re-resolves it once.
    if (query.knownTag) {
      const cached = await countWorks(query.knownTag);
      if (Number.isFinite(cached))
        return { source: "ao3", value: cached, raw: query.knownTag };
    }

    const tag = await resolveAo3Tag(query);
    if (!tag) return { source: "ao3", value: null };

    const count = await countWorks(tag);
    return Number.isFinite(count)
      ? { source: "ao3", value: count, raw: tag }
      : { source: "ao3", value: null };
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    console.warn(
      `[ao3] Lookup failed for "${query.name}"${status ? ` (${status})` : ""}`,
    );
    return { source: "ao3", value: null };
  }
};
