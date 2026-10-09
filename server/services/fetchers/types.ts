import type { MetricSourceId } from '../../../src/types';

/**
 * A reading from one upstream source.
 *
 * `value: null` means "no reading" - the source does not track this character,
 * or it was unreachable. There is deliberately no synthetic fallback: a
 * fabricated number is indistinguishable from a measurement once it reaches the
 * ranking, so an absent source stays absent all the way to the UI.
 */
export type MetricResult = {
  source: MetricSourceId;
  value: number | null;
  raw?: unknown;
};

/**
 * What a source needs in order to find the right character.
 *
 * A bare name is not enough. Danbooru files My Hero Academia's Todoroki as
 * `todoroki_shoto`, AO3's canonical tag is `Zhongli (Genshin Impact)`, and a
 * one-word name like "Xiao" or "Sunday" collides with unrelated characters
 * across both. The franchise hints are what separate a real match from a
 * confident wrong one.
 */
export type CharacterQuery = {
  name: string;
  aliases: string[];
  franchiseHints: string[];
  /**
   * The tag this source used last time, if we know it. Resolving a tag costs a
   * request against the slowest source in the pipeline and the answer almost
   * never changes, so it is remembered between refreshes.
   */
  knownTag?: string;
};

export type Fetcher = (query: CharacterQuery) => Promise<MetricResult>;

/**
 * Collapses the long-vowel spellings that split the same name across
 * catalogues: AniList writes "Shouto Todoroki", Danbooru writes
 * `todoroki_shoto`, and a plain string compare treats them as two people.
 */
const collapseLongVowels = (token: string) =>
  token.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/uu/g, 'u');

/**
 * The words of a name as spelled: lowercased, punctuation and underscores as
 * breaks (Danbooru writes spaces as underscores).
 *
 * Accents are dropped, not read as word breaks. NFKD splits "ō" into "o" and a
 * combining mark, and replacing the mark with a space turned "Ryōmen" into
 * "ryo men" and "Jäger" into "ja ger".
 */
export const plainWords = (value: string): string[] =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * Every word, initials included - the "L" in "L Lawliet" is the whole of his
 * AO3 tag - with long vowels collapsed, for comparing names.
 */
export const words = (value: string): string[] => plainWords(value).map(collapseLongVowels);

/** Lowercased word tokens, used for matching upstream tag names. */
export const tokenize = (value: string): string[] =>
  words(value).filter((token) => token.length > 1);

/**
 * Grammatical particles and release-shape words carry no franchise identity.
 *
 * `tokenize` keeps anything longer than one character, so the particles in a
 * romanised title survive it - and AniList's hints are full media titles
 * ("Gintama: Nanigoto mo Saisho ga Kanjin nanode..."). Left in, `no` alone
 * corroborates half the board: Kimetsu *no* Yaiba, Boku *no* Hero Academia,
 * Ore dake Level Up *na* Ken. That turns the franchise check - the thing that
 * is supposed to separate a real match from a confident wrong one - into a
 * formality. Eren Yeager's Danbooru tag was `fern_(sousou_no_frieren)` because
 * of it.
 */
export const NOISE = new Set([
  'no', 'na', 'ni', 'wa', 'ga', 'wo', 'mo', 'de', 'to', 'wu',
  'the', 'of', 'and', 'in', 'is', 'it', 'my', 'me',
  'season', 'movie', 'ova', 'ona', 'special', 'specials', 'tv', 'part', 'final',
  'nd', 'rd', 'th', 'st',
]);

/** The words that identify a franchise, across every title it goes by. */
export const franchiseTokens = (hints: string[]) =>
  [...new Set(hints.flatMap(tokenize))].filter((token) => !NOISE.has(token));
