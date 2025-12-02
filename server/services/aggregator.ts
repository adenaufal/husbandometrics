import { cacheClient, defaultTtlSeconds } from '../lib/cache';
import { MOCK_CHARACTERS } from '../../src/lib/constants';
import { Character, Trend } from '../../src/types';

interface RankingsResponse {
  refreshedAt: string;
  characters: Character[];
}

const CACHE_KEYS = {
  all: 'rankings:all',
  byId: (id: string) => `rankings:${id}`,
};

const normalizeCharacters = (characters: Character[]): Character[] => {
  return characters
    .map((character, index) => ({
      ...character,
      rank: index + 1,
      trend: character.trend ?? Trend.STABLE,
    }))
    .sort((a, b) => a.rank - b.rank);
};

const buildPayload = (characters: Character[]): RankingsResponse => ({
  refreshedAt: new Date().toISOString(),
  characters: normalizeCharacters(characters),
});

export const getAllRankings = async (): Promise<RankingsResponse> => {
  const cached = await cacheClient.get<RankingsResponse>(CACHE_KEYS.all);
  if (cached) return cached;

  const payload = buildPayload(MOCK_CHARACTERS);
  await cacheClient.set(CACHE_KEYS.all, payload, defaultTtlSeconds);
  return payload;
};

export const getCharacterById = async (id: string): Promise<Character | null> => {
  const cacheKey = CACHE_KEYS.byId(id);
  const cached = await cacheClient.get<Character>(cacheKey);
  if (cached) return cached;

  const { characters } = await getAllRankings();
  const match = characters.find((character) => character.id === id) ?? null;

  if (match) {
    await cacheClient.set(cacheKey, match, defaultTtlSeconds);
  }

  return match;
};

export const refreshRankings = async (): Promise<RankingsResponse> => {
  await cacheClient.delete(CACHE_KEYS.all);
  const refreshed = await getAllRankings();

  // Refresh individual caches so detail pages stay hot in Redis/Upstash
  await Promise.all(
    refreshed.characters.map((character) => cacheClient.set(CACHE_KEYS.byId(character.id), character, defaultTtlSeconds))
  );

  return refreshed;
};
