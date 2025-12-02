import { sql } from 'drizzle-orm';
import { datetime, double, int, mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const mysqlCharacters = mysqlTable('characters', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  sourceType: mysqlEnum('source_type', ['ANIME', 'GAME', 'MANGA']).notNull(),
  imageUrl: varchar('image_url', { length: 1024 }),
  createdAt: datetime('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const mysqlMetrics = mysqlTable('character_metrics', {
  id: int('id').primaryKey().autoincrement(),
  characterId: varchar('character_id', { length: 128 }).notNull(),
  pixiv: double('pixiv').notNull(),
  ao3: double('ao3').notNull(),
  googleTrends: double('google_trends').notNull(),
  danbooru: double('danbooru').notNull(),
  twitter: double('twitter').notNull(),
  weightedTotal: double('weighted_total').notNull(),
  recordedAt: datetime('recorded_at').default(sql`CURRENT_TIMESTAMP`),
});
