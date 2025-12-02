const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const generateSyntheticMetric = (key: string, modifier = 1) => {
  const base = hashString(key) % 60; // 0-59
  return Math.round(40 + base * modifier * 0.8);
};

type NormalizationConfig = {
  cap: number;
  softMax: number;
};

const NORMALIZATION_MAP: Record<string, NormalizationConfig> = {
  pixiv: { cap: 100, softMax: 220000 },
  ao3: { cap: 100, softMax: 120000 },
  google_trends: { cap: 100, softMax: 100 },
  danbooru: { cap: 100, softMax: 60000 },
  twitter: { cap: 100, softMax: 2000000 },
};

export const normalizeMetric = (source: keyof typeof NORMALIZATION_MAP, value: number) => {
  const config = NORMALIZATION_MAP[source];
  const score = (value / config.softMax) * 100;
  return Math.max(0, Math.min(config.cap, Number(score.toFixed(2))));
};
