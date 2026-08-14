export enum Trend {
  RISING = 'RISING',
  FALLING = 'FALLING',
  STABLE = 'STABLE'
}

export enum SourceType {
  ALL = 'ALL',
  ANIME = 'ANIME',
  GAME = 'GAME',
  MANGA = 'MANGA'
}

export enum TimePeriod {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}

/**
 * Every measured source. Anything not listed here is not measured, and is not
 * shown - the board never invents a number for a source it cannot read.
 */
export const METRIC_SOURCES = ['anilist', 'mal', 'ao3', 'danbooru'] as const;
export type MetricSourceId = (typeof METRIC_SOURCES)[number];

export const METRIC_SOURCE_LABELS: Record<MetricSourceId, string> = {
  anilist: 'AniList',
  mal: 'MyAnimeList',
  ao3: 'AO3',
  danbooru: 'Danbooru',
};

/** What each source counts, for display next to a raw figure. */
export const METRIC_SOURCE_UNITS: Record<MetricSourceId, string> = {
  anilist: 'favourites',
  mal: 'favorites',
  ao3: 'works',
  danbooru: 'posts',
};

/**
 * `null` means the source has no reading for this character - either it does not
 * track them or it was unreachable. It never means zero.
 */
export type ScoreBreakdown = Record<MetricSourceId, number | null>;

/** Raw upstream figures behind each score, so the UI can cite them. */
export type MetricCounts = Record<MetricSourceId, number | null>;

export interface HistoricalSnapshot {
  label: string;
  period: TimePeriod;
  scores: ScoreBreakdown;
  weighted_total: number;
}

export interface Character {
  id: string;
  rank: number;
  name: string;
  name_jp: string;
  romaji?: string;
  aliases?: string[];
  source: string;
  franchise?: string;
  source_type: SourceType;
  image_url: string;
  scores: ScoreBreakdown;
  counts: MetricCounts;
  weighted_total: number;
  trend: Trend;
  /** Sources that actually returned a reading for this character. */
  measured_sources: MetricSourceId[];
  description?: string;
  history?: HistoricalSnapshot[];
}
