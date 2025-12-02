-- Initialize husbandometrics schema
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_jp TEXT,
  franchise TEXT,
  source_type TEXT NOT NULL,
  image_url TEXT,
  pixiv INTEGER NOT NULL DEFAULT 0,
  ao3 INTEGER NOT NULL DEFAULT 0,
  google_trends INTEGER NOT NULL DEFAULT 0,
  booru INTEGER NOT NULL DEFAULT 0,
  twitter INTEGER NOT NULL DEFAULT 0,
  weighted_total INTEGER NOT NULL DEFAULT 0,
  trend TEXT DEFAULT 'STABLE'
);

CREATE INDEX IF NOT EXISTS idx_characters_source_type ON characters(source_type);

CREATE TABLE IF NOT EXISTS refresh_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  refreshed_at INTEGER NOT NULL,
  source TEXT DEFAULT 'cron',
  notes TEXT
);
