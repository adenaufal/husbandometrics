import 'dotenv/config';

type DatabaseProvider = 'turso' | 'planetscale' | 'none';

type WeightConfig = {
  pixiv: number;
  ao3: number;
  google_trends: number;
  danbooru: number;
  twitter: number;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const provider = (process.env.DATABASE_PROVIDER as DatabaseProvider | undefined) ?? 'none';

export const env = {
  provider,
  tursoUrl: process.env.TURSO_DATABASE_URL,
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
  planetscaleUrl: process.env.PLANETSCALE_URL,
  pixivToken: process.env.PIXIV_TOKEN,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  googleTrendsProxy: process.env.GOOGLE_TRENDS_PROXY,
  ao3BaseUrl: process.env.AO3_BASE_URL ?? 'https://archiveofourown.org',
  danbooruToken: process.env.DANBOORU_API_KEY,
  weights: {
    pixiv: parseNumber(process.env.WEIGHT_PIXIV, 0.35),
    ao3: parseNumber(process.env.WEIGHT_AO3, 0.25),
    google_trends: parseNumber(process.env.WEIGHT_GOOGLE_TRENDS, 0.2),
    danbooru: parseNumber(process.env.WEIGHT_DANBOORU, 0.1),
    twitter: parseNumber(process.env.WEIGHT_TWITTER, 0.1),
  } satisfies WeightConfig,
};

export type EnvConfig = typeof env;
