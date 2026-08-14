import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sqliteCharacters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  source: text('source').notNull(),
  sourceType: text('source_type', { enum: ['ANIME', 'GAME', 'MANGA'] }).notNull(),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
});

// Per-source columns are nullable on purpose: null records that a source had no
// reading for this character, which is different from a measured zero.
export const sqliteMetrics = sqliteTable('character_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  characterId: text('character_id').notNull(),
  anilist: real('anilist'),
  mal: real('mal'),
  ao3: real('ao3'),
  danbooru: real('danbooru'),
  weightedTotal: real('weighted_total').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp_ms' }).defaultNow(),
});
