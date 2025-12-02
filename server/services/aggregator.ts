import fs from 'fs/promises';
import path from 'path';
import { Character, ScoreBreakdown, SourceType, Trend } from '../../src/types';
import { env } from '../config/env';
import {
  fetchAo3Metric,
  fetchDanbooruMetric,
  fetchGoogleTrendsMetric,
  fetchPixivMetric,
  fetchTwitterMetric,
  MetricResult,
} from './fetchers';
import { normalizeMetric } from '../utils/metrics';
import {
  fetchLatestMetrics,
  fetchPersistedCharacters,
  saveMetricSnapshot,
  upsertCharacters,
} from '../db/repository';

interface SeedCharacter {
  id: string;
  name: string;
  name_jp: string;
  aliases?: string[];
  franchise: string;
  source_type: string;
  image_url: string;
  scores: Partial<ScoreBreakdown>;
  weighted_total?: number;
}

interface SeedPayload {
  characters: SeedCharacter[];
  metadata: {
    weights: ScoreBreakdown;
    version: string;
  };
}

const loadSeedCharacters = async (): Promise<SeedPayload> => {
  const seedPath = path.join(process.cwd(), 'src', 'data', 'seed-characters.json');
  const raw = await fs.readFile(seedPath, 'utf-8');
  return JSON.parse(raw) as SeedPayload;
};

const computeWeightedScore = (scores: ScoreBreakdown) => {
  const total =
    scores.pixiv * env.weights.pixiv +
    scores.ao3 * env.weights.ao3 +
    scores.google_trends * env.weights.google_trends +
    scores.danbooru * env.weights.danbooru +
    scores.twitter * env.weights.twitter;
  return Number(total.toFixed(2));
};

const computeTrend = (current: number, previous?: number) => {
  if (!previous) return Trend.STABLE;
  const delta = current - previous;
  if (delta > 1.5) return Trend.RISING;
  if (delta < -1.5) return Trend.FALLING;
  return Trend.STABLE;
};

const normalizeResults = (results: MetricResult[]): ScoreBreakdown => {
  const mapped: ScoreBreakdown = {
    pixiv: 0,
    ao3: 0,
    google_trends: 0,
    danbooru: 0,
    twitter: 0,
  };

  results.forEach((result) => {
    mapped[result.source] = normalizeMetric(result.source, result.value);
  });

  return mapped;
};

const fetchMetricsForCharacter = async (character: SeedCharacter) => {
  const [pixiv, ao3, google, danbooru, twitter] = await Promise.all([
    fetchPixivMetric(character.name),
    fetchAo3Metric(character.name),
    fetchGoogleTrendsMetric(character.name),
    fetchDanbooruMetric(character.name),
    fetchTwitterMetric(character.name),
  ]);

  return normalizeResults([pixiv, ao3, google, danbooru, twitter]);
};

const hydrateFromDatabase = async (seedCharacters: SeedCharacter[]) => {
  const persistedCharacters = await fetchPersistedCharacters();
  if (!persistedCharacters) return null;

  const persistedMetrics = await fetchLatestMetrics(seedCharacters.map((c) => c.id));
  if (!persistedMetrics) return null;

  return seedCharacters.map((character) => {
    const metrics = persistedMetrics[character.id];
    const breakdown: ScoreBreakdown = {
      pixiv: metrics?.pixiv ?? 0,
      ao3: metrics?.ao3 ?? 0,
      google_trends: metrics?.google_trends ?? 0,
      danbooru: metrics?.danbooru ?? 0,
      twitter: metrics?.twitter ?? 0,
    };

    const weighted_total = metrics?.weighted_total ?? computeWeightedScore(breakdown);

    return {
      ...character,
      trend: computeTrend(weighted_total, metrics?.weighted_total),
      weighted_total,
      scores: breakdown,
    } as unknown as Character;
  });
};

const mapSeedToCharacter = (seed: SeedCharacter, breakdown: ScoreBreakdown, previous?: number) => {
  const weighted_total = computeWeightedScore(breakdown);
  return {
    id: seed.id,
    name: seed.name,
    name_jp: seed.name_jp,
    source: seed.franchise,
    source_type: (seed.source_type as keyof typeof SourceType) in SourceType
      ? (seed.source_type.toUpperCase() as SourceType)
      : SourceType.ANIME,
    image_url: seed.image_url,
    weighted_total,
    scores: breakdown,
    trend: computeTrend(weighted_total, previous),
    rank: 0,
  } as Character;
};

export const getAllRankings = async () => {
  const seed = await loadSeedCharacters();

  // Try to hydrate from database if configured
  const hydrated = await hydrateFromDatabase(seed.characters);
  let characters: Character[];

  if (hydrated) {
    characters = hydrated;
  } else {
    const resolved = await Promise.all(
      seed.characters.map(async (character) => {
        const metrics = await fetchMetricsForCharacter(character);
        return mapSeedToCharacter(character, metrics, character.weighted_total);
      }),
    );
    characters = resolved;
  }

  characters.sort((a, b) => b.weighted_total - a.weighted_total);
  characters.forEach((character, index) => {
    characters[index] = { ...character, rank: index + 1 };
  });

  // Persist data if database is connected
  await upsertCharacters(
    characters.map((character) => ({
      id: character.id,
      name: character.name,
      source: character.source,
      source_type: character.source_type,
      image_url: character.image_url,
      weighted_total: character.weighted_total,
    })),
  );

  await Promise.all(
    characters.map((character) =>
      saveMetricSnapshot({
        character_id: character.id,
        ...character.scores,
        weighted_total: character.weighted_total,
      }),
    ),
  );

  return {
    metadata: {
      updated_at: new Date().toISOString(),
      weights: env.weights,
      mode: hydrated ? 'database' : 'live',
    },
    characters,
  };
};

export const getCharacterById = async (id: string) => {
  const rankings = await getAllRankings();
  return rankings.characters.find((character) => character.id === id) ?? null;
};
