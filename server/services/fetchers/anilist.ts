import { http } from './http';
import { SourceType } from '../../../src/types';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const CHARACTER_FIELDS = `
  id
  name { full native alternative }
  gender
  favourites
  image { large }
  media(sort: POPULARITY_DESC, perPage: 3) { nodes { title { romaji english native } format } }
`;

type AniListCharacter = {
  id: number;
  name: { full: string; native: string | null; alternative: string[] | null };
  gender: string | null;
  favourites: number | null;
  image: { large: string | null } | null;
  media: {
    nodes: Array<{
      title: { romaji: string | null; english: string | null; native: string | null };
      format: string | null;
    }>;
  };
};

export type CharacterProfile = {
  anilistId: number;
  name: string;
  nameJp: string;
  aliases: string[];
  franchise: string;
  /**
   * Every title the franchise goes by. AO3 and Danbooru each pick a different
   * one - romaji, English, or a localised variant - so matching needs all of
   * them.
   */
  franchiseHints: string[];
  sourceType: SourceType;
  imageUrl: string | null;
  favourites: number | null;
};

/** AniList only catalogues anime and manga, so nothing here maps to GAME. */
const MANGA_FORMATS = new Set(['MANGA', 'ONE_SHOT', 'NOVEL']);

const resolveSourceType = (format: string | null | undefined): SourceType =>
  format && MANGA_FORMATS.has(format) ? SourceType.MANGA : SourceType.ANIME;

const toProfile = (character: AniListCharacter): CharacterProfile => {
  const primaryMedia = character.media.nodes[0];
  const franchiseHints = character.media.nodes
    .flatMap((node) => [node.title.english, node.title.romaji])
    .filter((title): title is string => Boolean(title));

  return {
    anilistId: character.id,
    name: character.name.full,
    nameJp: character.name.native ?? '',
    aliases: (character.name.alternative ?? []).filter(Boolean),
    franchise: primaryMedia?.title.english ?? primaryMedia?.title.romaji ?? 'Unknown',
    franchiseHints: [...new Set(franchiseHints)],
    sourceType: resolveSourceType(primaryMedia?.format),
    imageUrl: character.image?.large ?? null,
    favourites: character.favourites ?? null,
  };
};

const post = async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
  const response = await http.post(ANILIST_ENDPOINT, { query, variables });
  if (response.data?.errors?.length) {
    throw new Error(`AniList: ${response.data.errors[0]?.message ?? 'unknown error'}`);
  }
  return response.data.data as T;
};

/**
 * Roster discovery for anime and manga. AniList cannot filter by gender in the
 * query, so pages are pulled until enough male characters accumulate.
 */
export const discoverTopMaleCharacters = async (limit: number): Promise<CharacterProfile[]> => {
  const query = `
    query ($page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        characters(sort: FAVOURITES_DESC) { ${CHARACTER_FIELDS} }
      }
    }`;

  const collected: CharacterProfile[] = [];
  // Cap the paging so a shifting upstream ordering cannot spin this forever.
  // Roughly two thirds of AniList's top characters are female, so reaching a
  // male roster of N needs noticeably more than N/50 pages.
  for (let page = 1; page <= 20 && collected.length < limit; page += 1) {
    const data = await post<{
      Page: { pageInfo: { hasNextPage: boolean }; characters: AniListCharacter[] };
    }>(query, { page });

    collected.push(
      ...data.Page.characters.filter((character) => character.gender === 'Male').map(toProfile),
    );

    if (!data.Page.pageInfo.hasNextPage) break;
  }

  return collected.slice(0, limit);
};

export type ProfileLookup = { key: string; name: string; franchiseHints: string[] };

/**
 * Words too generic to identify a franchise on their own. Without this, "Star"
 * would match anything with "star" in the title.
 */
const GENERIC_TITLE_WORDS = new Set([
  'the', 'of', 'and', 'no', 'wo', 'ga', 'ni', 'impact', 'star', 'rail', 'story', 'legend',
  'comic', 'anthology', 'season', 'movie', 'part', 'special',
]);

/**
 * Distinctive words in a franchise title.
 *
 * Whole-string comparison is too strict: AniList files Genshin characters under
 * "Genshin Dengeki Comic Anthology" and "Yuanshen: Chen Jian Xing Lu", neither
 * of which equals "Genshin Impact", so exact matching rejected the correct
 * character along with the wrong ones.
 */
const franchiseWords = (title: string): string[] =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !GENERIC_TITLE_WORDS.has(word));

/**
 * Profiles for characters the roster names explicitly. Sent as one aliased
 * query so a 13-name roster costs a single request against AniList's limit.
 *
 * A search hit is only accepted when its franchise corroborates it. Searching
 * "Xiao" returns a character with 22,000 favourites who is not the Genshin
 * Xiao, and taking the top hit on faith produced exactly that - a real-looking
 * number attached to the wrong person, which is worse than no number at all.
 */
export const lookupProfiles = async (
  lookups: ProfileLookup[],
): Promise<Record<string, CharacterProfile | null>> => {
  if (!lookups.length) return {};

  const variableDefs = lookups.map((_, index) => `$s${index}: String`).join(', ');
  const selections = lookups
    .map(
      (_, index) => `
      c${index}: Page(perPage: 5) {
        characters(search: $s${index}, sort: FAVOURITES_DESC) { ${CHARACTER_FIELDS} }
      }`,
    )
    .join('\n');

  const query = `query (${variableDefs}) {${selections}\n}`;
  const variables = Object.fromEntries(lookups.map((lookup, index) => [`s${index}`, lookup.name]));

  const data = await post<Record<string, { characters: AniListCharacter[] }>>(query, variables);

  return Object.fromEntries(
    lookups.map((lookup, index) => {
      const hintWords = new Set(lookup.franchiseHints.flatMap(franchiseWords));
      const candidates = (data[`c${index}`]?.characters ?? []).map(toProfile);

      const confirmed = candidates.find((profile) =>
        profile.franchiseHints.some((title) =>
          franchiseWords(title).some((word) => hintWords.has(word)),
        ),
      );

      return [lookup.key, confirmed ?? null];
    }),
  );
};
