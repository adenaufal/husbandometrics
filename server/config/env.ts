import 'dotenv/config';

type DatabaseProvider = 'turso' | 'planetscale' | 'none';

type WeightConfig = {
  anilist: number;
  mal: number;
  ao3: number;
  danbooru: number;
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
  ao3BaseUrl: process.env.AO3_BASE_URL ?? 'https://archiveofourown.org',
  danbooruToken: process.env.DANBOORU_API_KEY,
  /** How many anime/manga characters to pull from AniList's favourites board. */
  animeRosterSize: parseNumber(process.env.ANIME_ROSTER_SIZE, 27),
  weights: {
    anilist: parseNumber(process.env.WEIGHT_ANILIST, 0.35),
    mal: parseNumber(process.env.WEIGHT_MAL, 0.25),
    ao3: parseNumber(process.env.WEIGHT_AO3, 0.2),
    danbooru: parseNumber(process.env.WEIGHT_DANBOORU, 0.2),
  } satisfies WeightConfig,
};

export type EnvConfig = typeof env;
