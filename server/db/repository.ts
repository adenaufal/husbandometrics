import { inArray } from 'drizzle-orm';
import { getConnection, initConnection } from './client';
import { sqliteCharacters, sqliteMetrics } from './schema/sqlite';
import { mysqlCharacters, mysqlMetrics } from './schema/mysql';

export type PersistedCharacter = {
  id: string;
  name: string;
  source: string;
  source_type: string;
  image_url?: string | null;
  weighted_total?: number;
};

export type PersistedMetrics = {
  character_id: string;
  pixiv: number;
  ao3: number;
  google_trends: number;
  danbooru: number;
  twitter: number;
  weighted_total: number;
};

export const fetchPersistedCharacters = async (): Promise<PersistedCharacter[] | null> => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection) return null;

  if (connection.type === 'turso') {
    const results = await connection.db
      .select({
        id: sqliteCharacters.id,
        name: sqliteCharacters.name,
        source: sqliteCharacters.source,
        source_type: sqliteCharacters.sourceType,
        image_url: sqliteCharacters.imageUrl,
      })
      .from(sqliteCharacters);
    return results;
  }

  const results = await connection.db
    .select({
      id: mysqlCharacters.id,
      name: mysqlCharacters.name,
      source: mysqlCharacters.source,
      source_type: mysqlCharacters.sourceType,
      image_url: mysqlCharacters.imageUrl,
    })
    .from(mysqlCharacters);
  return results;
};

export const fetchLatestMetrics = async (ids: string[]): Promise<Record<string, PersistedMetrics> | null> => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection || ids.length === 0) return null;

  if (connection.type === 'turso') {
    const rows = await connection.db
      .select({
        character_id: sqliteMetrics.characterId,
        pixiv: sqliteMetrics.pixiv,
        ao3: sqliteMetrics.ao3,
        google_trends: sqliteMetrics.googleTrends,
        danbooru: sqliteMetrics.danbooru,
        twitter: sqliteMetrics.twitter,
        weighted_total: sqliteMetrics.weightedTotal,
      })
      .from(sqliteMetrics)
      .where(inArray(sqliteMetrics.characterId, ids));

    return rows.reduce<Record<string, PersistedMetrics>>((acc, row) => {
      acc[row.character_id] = row;
      return acc;
    }, {});
  }

  const rows = await connection.db
    .select({
      character_id: mysqlMetrics.characterId,
      pixiv: mysqlMetrics.pixiv,
      ao3: mysqlMetrics.ao3,
      google_trends: mysqlMetrics.googleTrends,
      danbooru: mysqlMetrics.danbooru,
      twitter: mysqlMetrics.twitter,
      weighted_total: mysqlMetrics.weightedTotal,
    })
    .from(mysqlMetrics)
    .where(inArray(mysqlMetrics.characterId, ids));

  return rows.reduce<Record<string, PersistedMetrics>>((acc, row) => {
    acc[row.character_id] = row;
    return acc;
  }, {});
};

export const saveMetricSnapshot = async (metrics: PersistedMetrics) => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection) return;

  if (connection.type === 'turso') {
    await connection.db.insert(sqliteMetrics).values({
      characterId: metrics.character_id,
      pixiv: metrics.pixiv,
      ao3: metrics.ao3,
      googleTrends: metrics.google_trends,
      danbooru: metrics.danbooru,
      twitter: metrics.twitter,
      weightedTotal: metrics.weighted_total,
    });
    return;
  }

  await connection.db.insert(mysqlMetrics).values({
    characterId: metrics.character_id,
    pixiv: metrics.pixiv,
    ao3: metrics.ao3,
    googleTrends: metrics.google_trends,
    danbooru: metrics.danbooru,
    twitter: metrics.twitter,
    weightedTotal: metrics.weighted_total,
  });
};

export const upsertCharacters = async (characters: PersistedCharacter[]) => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection) return;

  if (connection.type === 'turso') {
    const normalizedCharacters = characters.map((character) => ({
      id: character.id,
      name: character.name,
      source: character.source,
      sourceType: (character.source_type?.toUpperCase() as 'ANIME' | 'GAME' | 'MANGA') ?? 'ANIME',
      imageUrl: character.image_url,
    }));

    await connection.db.insert(sqliteCharacters).values(
      normalizedCharacters,
    );
    return;
  }

  const normalizedCharacters = characters.map((character) => ({
    id: character.id,
    name: character.name,
    source: character.source,
    sourceType: (character.source_type?.toUpperCase() as 'ANIME' | 'GAME' | 'MANGA') ?? 'ANIME',
    imageUrl: character.image_url,
  }));

  await connection.db.insert(mysqlCharacters).values(normalizedCharacters);
};
