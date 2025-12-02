import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameJp: text('name_jp'),
  franchise: text('franchise'),
  sourceType: text('source_type').notNull(),
  imageUrl: text('image_url'),
  pixiv: integer('pixiv').notNull().default(0),
  ao3: integer('ao3').notNull().default(0),
  googleTrends: integer('google_trends').notNull().default(0),
  booru: integer('booru').notNull().default(0),
  twitter: integer('twitter').notNull().default(0),
  weightedTotal: integer('weighted_total').notNull().default(0),
  trend: text('trend').default('STABLE'),
});

export const refreshLog = sqliteTable('refresh_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  refreshedAt: integer('refreshed_at', { mode: 'timestamp_ms' }).notNull(),
  source: text('source').default('cron'),
  notes: text('notes'),
});
