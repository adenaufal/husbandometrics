CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`source` text NOT NULL,
	`source_type` text NOT NULL,
	`image_url` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
--> statement-breakpoint
CREATE TABLE `character_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`character_id` text NOT NULL,
	`anilist` real,
	`mal` real,
	`ao3` real,
	`danbooru` real,
	`weighted_total` real NOT NULL,
	`recorded_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer))
);
