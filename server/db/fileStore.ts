import fs from 'fs/promises';
import path from 'path';
import type { PersistedMetrics } from './repository';

/**
 * Snapshot history kept as a committed JSON file.
 *
 * Trend and history need one thing: what the numbers were last time. A hosted
 * database is a lot of moving parts for a board that refreshes once a week and
 * never takes a write from a visitor, so the weekly job appends here and commits
 * the result. The file is the database.
 */
// Resolved per call, not captured at import: a module-level constant freezes
// whatever the working directory happened to be when the module first loaded.
const snapshotFile = () => path.join(process.cwd(), 'data', 'snapshots.json');

/** Two years of weekly readings. Old rows only make the file bigger. */
const MAX_PER_CHARACTER = 104;

type StoredSnapshot = Omit<PersistedMetrics, 'recorded_at'> & { recorded_at: string };

const readFile = async (): Promise<StoredSnapshot[]> => {
  try {
    return JSON.parse(await fs.readFile(snapshotFile(), 'utf-8')) as StoredSnapshot[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

/** Newest first per character, matching the database repository's contract. */
export const readSnapshots = async (
  ids: string[],
): Promise<Record<string, PersistedMetrics[]>> => {
  const wanted = new Set(ids);
  const rows = await readFile();

  return rows
    .filter((row) => wanted.has(row.character_id))
    .map((row) => ({ ...row, recorded_at: new Date(row.recorded_at) }))
    .sort((a, b) => b.recorded_at.getTime() - a.recorded_at.getTime())
    .reduce<Record<string, PersistedMetrics[]>>((acc, row) => {
      (acc[row.character_id] ??= []).push(row);
      return acc;
    }, {});
};

export const appendSnapshots = async (batch: PersistedMetrics[]) => {
  if (!batch.length) return;

  const rows = await readFile();

  const incoming: StoredSnapshot[] = batch.map((metrics) => {
    const recordedAt = metrics.recorded_at ?? new Date();
    return {
      character_id: metrics.character_id,
      anilist: metrics.anilist,
      mal: metrics.mal,
      ao3: metrics.ao3,
      danbooru: metrics.danbooru,
      weighted_total: metrics.weighted_total,
      recorded_at: recordedAt.toISOString(),
    };
  });

  // One reading per character per day. A refresh can be triggered by hand, and
  // several rows sharing a date would weight that day's average by how often
  // someone pressed the button.
  const replacing = new Set(
    incoming.map((row) => `${row.character_id}@${row.recorded_at.slice(0, 10)}`),
  );
  const kept = rows.filter(
    (row) => !replacing.has(`${row.character_id}@${row.recorded_at.slice(0, 10)}`),
  );
  kept.push(...incoming);

  const trimmed = Object.values(
    kept.reduce<Record<string, StoredSnapshot[]>>((acc, row) => {
      (acc[row.character_id] ??= []).push(row);
      return acc;
    }, {}),
  ).flatMap((group) =>
    group.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)).slice(-MAX_PER_CHARACTER),
  );

  trimmed.sort(
    (a, b) => a.recorded_at.localeCompare(b.recorded_at) || a.character_id.localeCompare(b.character_id),
  );

  const target = snapshotFile();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(trimmed, null, 2)}\n`, 'utf-8');
};
