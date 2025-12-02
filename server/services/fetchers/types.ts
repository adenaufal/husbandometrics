export type MetricResult = {
  source: 'pixiv' | 'ao3' | 'google_trends' | 'danbooru' | 'twitter';
  value: number;
  raw?: unknown;
};

export type Fetcher = (query: string) => Promise<MetricResult>;
