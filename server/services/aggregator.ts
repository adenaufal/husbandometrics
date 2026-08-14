import {
  Character,
  HistoricalSnapshot,
  METRIC_SOURCES,
  MetricCounts,
  MetricSourceId,
  ScoreBreakdown,
  SourceType,
  TimePeriod,
  Trend,
} from '../../src/types';
import { env } from '../config/env';
import { GAME_ROSTER } from '../data/gameRoster';
import {
  CharacterProfile,
  CharacterQuery,
  discoverTopMaleCharacters,
  fetchAo3Metric,
  fetchDanbooruMetric,
  fetchMalMetric,
  lookupProfiles,
} from './fetchers';
import { measuredSources, normalizeAgainstPeak, peaksBySource, weightedTotal } from '../utils/metrics';
import {
  fetchMetricHistory,
  fetchPersistedCharacters,
  saveMetricSnapshots,
  upsertCharacters,
  type PersistedMetrics,
} from '../db/repository';
import { cacheClient, defaultTtlSeconds } from '../lib/cache';

/** Keeps AO3 and Danbooru from rate-limiting a full roster refresh. */
const FETCH_CONCURRENCY = 4;

/** Below this, a character's total says more about our luck than their fandom. */
const MIN_SOURCES_TO_RANK = 2;

const CACHE_KEYS = {
  all: 'rankings:all',
  byId: (id: string) => `rankings:${id}`,
};

interface RankingsResponse {
  metadata: {
    updated_at: string;
    weights: Record<MetricSourceId, number>;
    sources: MetricSourceId[];
    roster: { anime: number; game: number };
    mode: string;
  };
  characters: Character[];
}

type RosterCharacter = {
  id: string;
  name: string;
  nameJp: string;
  aliases: string[];
  franchise: string;
  sourceType: SourceType;
  imageUrl: string | null;
  anilistFavourites: number | null;
  franchiseHints: string[];
};

const emptyBreakdown = (): ScoreBreakdown =>
  Object.fromEntries(METRIC_SOURCES.map((source) => [source, null])) as ScoreBreakdown;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const toRosterCharacter = (
  profile: CharacterProfile,
  overrides: Partial<RosterCharacter> = {},
): RosterCharacter => ({
  id: slugify(profile.name),
  name: profile.name,
  nameJp: profile.nameJp,
  aliases: profile.aliases,
  franchise: profile.franchise,
  sourceType: profile.sourceType,
  imageUrl: profile.imageUrl,
  anilistFavourites: profile.favourites,
  franchiseHints: profile.franchiseHints,
  ...overrides,
});

/**
 * The board is the union of two lists: anime and manga characters discovered
 * from AniList's favourites ranking, and the curated game roster, whose
 * identity still comes from a live AniList lookup wherever one exists.
 */
const buildRoster = async (): Promise<RosterCharacter[]> => {
  const [discovered, curatedProfiles] = await Promise.all([
    discoverTopMaleCharacters(env.animeRosterSize),
    lookupProfiles(
      GAME_ROSTER.map((entry) => ({
        key: entry.id,
        name: entry.name,
        franchiseHints: entry.franchiseHints,
      })),
    ),
  ]);

  const roster: RosterCharacter[] = discovered.map((profile) => toRosterCharacter(profile));
  const seen = new Set(roster.map((character) => character.id));

  GAME_ROSTER.forEach((entry) => {
    const profile = curatedProfiles[entry.id];
    // Franchise and type come from the roster: AniList files gacha characters
    // under whatever anthology manga happens to mention them.
    roster.push({
      id: entry.id,
      name: entry.name,
      nameJp: profile?.nameJp ?? '',
      aliases: [...new Set([...entry.aliases, ...(profile?.aliases ?? [])])],
      franchise: entry.franchise,
      sourceType: entry.sourceType,
      imageUrl: profile?.imageUrl ?? entry.imageUrl ?? null,
      anilistFavourites: profile?.favourites ?? null,
      franchiseHints: entry.franchiseHints,
    });
    seen.add(entry.id);
  });

  return roster.filter((character, index) => roster.findIndex((c) => c.id === character.id) === index);
};

/**
 * AniList and MyAnimeList catalogue anime and manga, so neither applies to a
 * game character.
 *
 * They do return a figure for some of them - Zhongli has 1,019 AniList
 * favourites via a Genshin anthology manga - but that measures how many people
 * catalogued a tie-in comic, not how popular he is. Counting it would rank the
 * character with the highest Danbooru tally on the board at #20, for a reason
 * that is about catalogue coverage rather than popularity. Their profile is
 * still used for the portrait and the Japanese name.
 */
const sourceApplies = (source: MetricSourceId, sourceType: SourceType) =>
  sourceType !== SourceType.GAME || (source !== 'anilist' && source !== 'mal');

const readCounts = async (character: RosterCharacter): Promise<MetricCounts> => {
  const query: CharacterQuery = {
    name: character.name,
    aliases: character.aliases,
    franchiseHints: [character.franchise, ...character.franchiseHints],
  };

  const [ao3, danbooru, mal] = await Promise.all([
    fetchAo3Metric(query),
    fetchDanbooruMetric(query),
    sourceApplies('mal', character.sourceType) ? fetchMalMetric(query) : { value: null },
  ]);

  const counts: MetricCounts = {
    anilist: character.anilistFavourites,
    mal: mal.value,
    ao3: ao3.value,
    danbooru: danbooru.value,
  };

  METRIC_SOURCES.forEach((source) => {
    if (!sourceApplies(source, character.sourceType)) counts[source] = null;
  });

  return counts;
};

const computeTrend = (current: number, previous?: number | null) => {
  if (previous === undefined || previous === null) return Trend.STABLE;
  const delta = current - previous;
  if (delta > 1.5) return Trend.RISING;
  if (delta < -1.5) return Trend.FALLING;
  return Trend.STABLE;
};

const bucketKey = (date: Date, period: TimePeriod) => {
  if (period === TimePeriod.YEAR) return String(date.getUTCFullYear());
  if (period === TimePeriod.MONTH) {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  return date.toISOString().slice(0, 10);
};

const averageOrNull = (values: Array<number | null>) => {
  const present = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!present.length) return null;
  return Number((present.reduce((sum, value) => sum + value, 0) / present.length).toFixed(2));
};

/**
 * Snapshots land weekly (see tasks/scheduler). MONTH and YEAR are averages over
 * the same rows rather than separately stored series - one source of truth.
 */
const buildHistory = (snapshots: PersistedMetrics[]): HistoricalSnapshot[] => {
  const chronological = [...snapshots]
    .filter((row) => row.recorded_at instanceof Date)
    .sort((a, b) => (a.recorded_at as Date).getTime() - (b.recorded_at as Date).getTime());
  if (!chronological.length) return [];

  return [TimePeriod.WEEK, TimePeriod.MONTH, TimePeriod.YEAR].flatMap((period) => {
    const buckets = new Map<string, PersistedMetrics[]>();
    chronological.forEach((row) => {
      const key = bucketKey(row.recorded_at as Date, period);
      const existing = buckets.get(key);
      if (existing) existing.push(row);
      else buckets.set(key, [row]);
    });

    return [...buckets.entries()].map(([label, rows]) => ({
      label,
      period,
      scores: Object.fromEntries(
        METRIC_SOURCES.map((source) => [source, averageOrNull(rows.map((row) => row[source]))]),
      ) as ScoreBreakdown,
      weighted_total: Number(
        (rows.reduce((sum, row) => sum + row.weighted_total, 0) / rows.length).toFixed(2),
      ),
    }));
  });
};

const fetchRankingsFromSource = async (): Promise<RankingsResponse> => {
  const roster = await buildRoster();

  const readings: Array<{ character: RosterCharacter; counts: MetricCounts }> = [];
  for (let i = 0; i < roster.length; i += FETCH_CONCURRENCY) {
    const batch = await Promise.all(
      roster.slice(i, i + FETCH_CONCURRENCY).map(async (character) => ({
        character,
        counts: await readCounts(character),
      })),
    );
    readings.push(...batch);
  }

  // Scores are relative, so every peak has to be known before any character can
  // be scored.
  const peaks = peaksBySource(readings.map((reading) => reading.counts));
  const history = await fetchMetricHistory(roster.map((character) => character.id));

  const characters = readings
    .map(({ character, counts }) => {
      const scores = Object.fromEntries(
        METRIC_SOURCES.map((source) => [source, normalizeAgainstPeak(counts[source], peaks[source])]),
      ) as ScoreBreakdown;

      const measured = measuredSources(scores);
      // One reading is not a ranking. A transient AO3 failure once left a
      // character scored on Danbooru alone, which put him at #9 on the strength
      // of a single number nobody else was being compared on.
      if (measured.length < MIN_SOURCES_TO_RANK) return null;

      const total = weightedTotal(scores, env.weights);
      if (total === null) return null;

      const snapshots = history?.[character.id] ?? [];
      const character_: Character = {
        id: character.id,
        name: character.name,
        name_jp: character.nameJp,
        aliases: character.aliases,
        source: character.franchise,
        franchise: character.franchise,
        source_type: character.sourceType,
        image_url: character.imageUrl ?? '',
        scores,
        counts,
        weighted_total: total,
        // Newest first, so [0] is the reading this run replaces.
        trend: computeTrend(total, snapshots[0]?.weighted_total),
        measured_sources: measured,
        history: buildHistory(snapshots),
        rank: 0,
      };
      return character_;
    })
    .filter((character): character is Character => character !== null);

  characters.sort((a, b) => b.weighted_total - a.weighted_total);
  characters.forEach((character, index) => {
    characters[index] = { ...character, rank: index + 1 };
  });

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

  await saveMetricSnapshots(
    characters.map((character) => ({
      character_id: character.id,
      ...character.scores,
      weighted_total: character.weighted_total,
    })),
  );

  const persisted = await fetchPersistedCharacters();

  return {
    metadata: {
      updated_at: new Date().toISOString(),
      weights: env.weights,
      sources: [...METRIC_SOURCES],
      roster: {
        anime: characters.filter((c) => c.source_type !== SourceType.GAME).length,
        game: characters.filter((c) => c.source_type === SourceType.GAME).length,
      },
      mode: persisted?.length ? 'live+persisted' : 'live',
    },
    characters,
  };
};

export const getAllRankings = async (): Promise<RankingsResponse> => {
  const cached = await cacheClient.get<RankingsResponse>(CACHE_KEYS.all);
  if (cached) return cached;

  const payload = await fetchRankingsFromSource();
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

  await Promise.all(
    refreshed.characters.map((character) =>
      cacheClient.set(CACHE_KEYS.byId(character.id), character, defaultTtlSeconds),
    ),
  );

  return refreshed;
};

export { emptyBreakdown };
