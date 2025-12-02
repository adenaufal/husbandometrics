import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sqliteCharacters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  source: text('source').notNull(),
  sourceType: text('source_type', { enum: ['ANIME', 'GAME', 'MANGA'] }).notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const sqliteMetrics = sqliteTable('character_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: text('character_id').notNull(),
  pixiv: real('pixiv').notNull(),
  ao3: real('ao3').notNull(),
  googleTrends: real('google_trends').notNull(),
  danbooru: real('danbooru').notNull(),
  twitter: real('twitter').notNull(),
  weightedTotal: real('weighted_total').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).defaultNow(),
});
