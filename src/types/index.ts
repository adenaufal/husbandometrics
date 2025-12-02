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

export interface ScoreBreakdown {
  pixiv: number;
  ao3: number;
  google_trends: number;
  booru: number;
  twitter: number;
}

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
  weighted_total: number;
  trend: Trend;
  description?: string;
  history?: HistoricalSnapshot[];
}
