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
};

export type Fetcher = (query: CharacterQuery) => Promise<MetricResult>;

/**
 * Collapses the long-vowel spellings that split the same name across
 * catalogues: AniList writes "Shouto Todoroki", Danbooru writes
 * `todoroki_shoto`, and a plain string compare treats them as two people.
 */
const collapseLongVowels = (token: string) =>
  token.replace(/ou/g, 'o').replace(/oo/g, 'o').replace(/uu/g, 'u').replace(/[āīūēō]/g, (vowel) =>
    ({ ā: 'a', ī: 'i', ū: 'u', ē: 'e', ō: 'o' })[vowel] ?? vowel,
  );

/** Lowercased word tokens, used for matching upstream tag names. */
export const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .map(collapseLongVowels);
