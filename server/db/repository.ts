import { desc, inArray, sql } from 'drizzle-orm';
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
  anilist: number | null;
  mal: number | null;
  ao3: number | null;
  danbooru: number | null;
  weighted_total: number;
  recorded_at?: Date | null;
};

export const fetchPersistedCharacters = async (): Promise<PersistedCharacter[] | null> => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection) return null;

  if (connection.type === 'turso') {
    return connection.db
      .select({
        id: sqliteCharacters.id,
        name: sqliteCharacters.name,
        source: sqliteCharacters.source,
        source_type: sqliteCharacters.sourceType,
        image_url: sqliteCharacters.imageUrl,
      })
      .from(sqliteCharacters);
  }

  return connection.db
    .select({
      id: mysqlCharacters.id,
      name: mysqlCharacters.name,
      source: mysqlCharacters.source,
      source_type: mysqlCharacters.sourceType,
      image_url: mysqlCharacters.imageUrl,
    })
    .from(mysqlCharacters);
};

/**
 * Snapshots per character, newest first. The caller needs more than the latest
 * row: [0] is the previous reading used to derive a trend, and the whole list
 * backs the history chart.
 */
export const fetchMetricHistory = async (
  ids: string[],
): Promise<Record<string, PersistedMetrics[]> | null> => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection || ids.length === 0) return null;

  const rows =
    connection.type === 'turso'
      ? await connection.db
          .select({
            character_id: sqliteMetrics.characterId,
            anilist: sqliteMetrics.anilist,
            mal: sqliteMetrics.mal,
            ao3: sqliteMetrics.ao3,
            danbooru: sqliteMetrics.danbooru,
            weighted_total: sqliteMetrics.weightedTotal,
            recorded_at: sqliteMetrics.recordedAt,
          })
          .from(sqliteMetrics)
          .where(inArray(sqliteMetrics.characterId, ids))
          .orderBy(desc(sqliteMetrics.recordedAt))
      : await connection.db
          .select({
            character_id: mysqlMetrics.characterId,
            anilist: mysqlMetrics.anilist,
            mal: mysqlMetrics.mal,
            ao3: mysqlMetrics.ao3,
            danbooru: mysqlMetrics.danbooru,
            weighted_total: mysqlMetrics.weightedTotal,
            recorded_at: mysqlMetrics.recordedAt,
          })
          .from(mysqlMetrics)
          .where(inArray(mysqlMetrics.characterId, ids))
          .orderBy(desc(mysqlMetrics.recordedAt));

  return rows.reduce<Record<string, PersistedMetrics[]>>((acc, row) => {
    (acc[row.character_id] ??= []).push({ ...row, recorded_at: row.recorded_at ?? null });
    return acc;
  }, {});
};

export const saveMetricSnapshot = async (metrics: PersistedMetrics) => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection) return;

  const values = {
    characterId: metrics.character_id,
    anilist: metrics.anilist,
    mal: metrics.mal,
    ao3: metrics.ao3,
    danbooru: metrics.danbooru,
    weightedTotal: metrics.weighted_total,
  };

  if (connection.type === 'turso') {
    await connection.db.insert(sqliteMetrics).values(values);
    return;
  }

  await connection.db.insert(mysqlMetrics).values(values);
};

export const upsertCharacters = async (characters: PersistedCharacter[]) => {
  const connection = getConnection() ?? (await initConnection());
  if (!connection || !characters.length) return;

  const normalizedCharacters = characters.map((character) => ({
    id: character.id,
    name: character.name,
    source: character.source,
    sourceType: (character.source_type?.toUpperCase() as 'ANIME' | 'GAME' | 'MANGA') ?? 'ANIME',
    imageUrl: character.image_url,
  }));

  if (connection.type === 'turso') {
    await connection.db
      .insert(sqliteCharacters)
      .values(normalizedCharacters)
      .onConflictDoUpdate({
        target: sqliteCharacters.id,
        set: {
          name: sql`excluded.name`,
          source: sql`excluded.source`,
          sourceType: sql`excluded.source_type`,
          imageUrl: sql`excluded.image_url`,
        },
      });
    return;
  }

  await connection.db
    .insert(mysqlCharacters)
    .values(normalizedCharacters)
    .onDuplicateKeyUpdate({
      set: {
        name: sql`values(name)`,
        source: sql`values(source)`,
        sourceType: sql`values(source_type)`,
        imageUrl: sql`values(image_url)`,
      },
    });
};
