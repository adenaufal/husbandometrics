import { createPacer, http } from './http';
import { CharacterQuery, MetricResult, franchiseTokens, tokenize } from './types';

/**
 * MyAnimeList favourites, read from MAL's own top-characters board.
 *
 * This used to go through Jikan's `/characters` endpoints, and read 0/103 for
 * months. Jikan itself is up - `/v4/anime?q=naruto` answers 200 - but every
 * character route answers `504 BadResponseException: "Jikan failed to connect
 * to MyAnimeList"`, including a plain id lookup. The character resource is
 * broken upstream and no amount of retrying or pacing changes that.
 *
 * MAL's own board is reachable, carries the figure we want in the markup, and
 * costs 20 requests for 1,000 characters instead of one per character. It is
 * not disallowed by MAL's robots.txt for a generic agent.
 *
 * The board is favourites-ranked, so reading the top N is the right shape for
 * this roster: it is built from AniList's favourites ranking, and anyone
 * popular enough to be on it is popular enough to be here. Anyone outside the
 * window is a null reading, which is what a null has always meant.
 */
const paced = createPacer(1100);

const PAGE_SIZE = 50;
const TOP_CHARACTERS = Number(process.env.MAL_TOP_CHARACTERS ?? 1000);

/** One row of MAL's top-characters board. */
export type BoardEntry = {
  favorites: number;
  /** Name tokens, e.g. `Gojou, Satoru` -> ['gojou','satoru']. */
  name: string[];
  /** Tokens of every anime/manga title the character appears in. */
  works: Set<string>;
};

/**
 * A row is `<td class="people">` (id, name) ... `<td class="favorites">`. The
 * animeography and mangaography cells in between are what corroborates a match,
 * so they are captured too rather than skipped.
 */
const ROW =
  /<td class="people">.*?class="fs14 fw-b">([^<]*)<\/a>(.*?)<td class="favorites">\s*([\d,]+)\s*<\/td>/g;
const WORK = /\/(?:anime|manga)\/\d+\/[^"]*"[^>]*>([^<]*)</g;

export const parseBoard = (html: string): BoardEntry[] => {
  const entries: BoardEntry[] = [];

  for (const row of html.replace(/\n/g, '').matchAll(ROW)) {
    const name = tokenize(row[1]);
    if (!name.length) continue; // A name that tokenizes to nothing matches everything.
    entries.push({
      favorites: Number(row[3].replace(/,/g, '')),
      name,
      works: new Set([...row[2].matchAll(WORK)].flatMap((work) => tokenize(work[1]))),
    });
  }

  return entries;
};

/**
 * Read once per process, not once per character. The board is the same for
 * every lookup, and a refresh asks for it ~90 times.
 */
let board: Promise<BoardEntry[]> | null = null;

const loadBoard = async (): Promise<BoardEntry[]> => {
  const entries: BoardEntry[] = [];

  for (let offset = 0; offset < TOP_CHARACTERS; offset += PAGE_SIZE) {
    try {
      const response = await paced(() =>
        http.get('https://myanimelist.net/character.php', { params: { limit: offset } }),
      );
      const page = parseBoard(String(response.data));
      // A page that parses to nothing means the markup moved; stop rather than
      // walk the rest of the board collecting empties.
      if (!page.length) {
        console.warn(`[mal] No rows parsed at offset ${offset} - stopping.`);
        break;
      }
      entries.push(...page);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      console.warn(`[mal] Board page ${offset} failed${status ? ` (${status})` : ''}.`);
      break;
    }
  }

  console.log(`[mal] Board loaded: ${entries.length} characters.`);
  return entries;
};

const subset = (needle: string[], haystack: string[]) =>
  needle.length > 0 && needle.every((token) => haystack.includes(token));

/**
 * Match by name, then make the franchise agree.
 *
 * A name alone is not enough in either direction. "Levi" is one row on the
 * board and eleven characters in a free-text search; "Thorfinn Karlsefni" is
 * filed as plain "Thorfinn"; MAL writes `Yeager, Eren` where AniList writes
 * "Eren Yeager". So: exact token match wins if the franchise agrees, an exact
 * match that is the only one on the whole board is taken on its own (MAL romanises
 * titles - "Shingeki no Kyojin" shares no token with "Attack on Titan" - so
 * requiring the franchise there would drop real matches), and a looser subset
 * match is only ever accepted with the franchise behind it.
 *
 * Anything still ambiguous returns null. A confident wrong match is worse than
 * no match.
 */
export const findOnBoard = (query: CharacterQuery, entries: BoardEntry[]): BoardEntry | null => {
  const names = [query.name, ...query.aliases].map(tokenize).filter((name) => name.length);
  if (!names.length) return null;

  const franchise = franchiseTokens(query.franchiseHints);
  const corroborated = (entry: BoardEntry) => franchise.some((token) => entry.works.has(token));

  // One name at a time, best evidence first. Pooling them lets a nickname
  // outvote the real name: Gintoki Sakata is one row on the board, but he also
  // answers to Kintoki, Ginko, Johnny and eighteen others, and any of those
  // landing on some unrelated row makes the whole lookup ambiguous. Resolving
  // "Gintoki Sakata" on its own settles it before an alias is ever consulted.
  for (const name of names) {
    const exact = entries.filter(
      (entry) => name.length === entry.name.length && subset(name, entry.name),
    );

    const confirmed = exact.filter(corroborated);
    if (confirmed.length === 1) return confirmed[0];
    if (confirmed.length > 1) continue; // Ambiguous on this name; a later one may be cleaner.
    if (exact.length === 1) return exact[0];
  }

  for (const name of names) {
    const loose = entries.filter(
      (entry) => subset(name, entry.name) || subset(entry.name, name),
    );
    const confirmed = loose.filter(corroborated);
    if (confirmed.length === 1) return confirmed[0];
  }

  return null;
};

export const fetchMalMetric = async (query: CharacterQuery): Promise<MetricResult> => {
  board ??= loadBoard();
  const entry = findOnBoard(query, await board);

  return entry
    ? { source: 'mal', value: entry.favorites, raw: entry.name.join(' ') }
    : { source: 'mal', value: null };
};
