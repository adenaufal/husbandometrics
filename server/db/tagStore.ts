import fs from 'fs/promises';
import path from 'path';
import type { MetricSourceId } from '../../src/types';

/**
 * Upstream tag names, remembered between refreshes.
 *
 * Half of every AO3 read is spent asking which tag a character is filed under —
 * "Zhongli (Genshin Impact)", "Bakugou Katsuki" — and that answer changes about
 * never. Caching it halves the requests to the slowest source in the pipeline,
 * which is what decides how long a refresh takes.
 */
const tagFile = () => path.join(process.cwd(), 'data', 'tags.json');

export type KnownTags = Partial<Record<MetricSourceId, string>>;

export const readTags = async (): Promise<Record<string, KnownTags>> => {
  try {
    return JSON.parse(await fs.readFile(tagFile(), 'utf-8')) as Record<string, KnownTags>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
};

/**
 * Merged rather than replaced: a character whose source failed this run keeps
 * the tag we already knew, instead of paying to resolve it again next week.
 *
 * `forget` is the exception - tags found to name someone else. Those go even
 * when nothing replaced them: no tag is a null reading, a wrong one a wrong
 * number.
 */
export const writeTags = async (
  resolved: Record<string, KnownTags>,
  forget: Record<string, MetricSourceId[]> = {},
) => {
  const existing = await readTags();
  const merged: Record<string, KnownTags> = { ...existing };

  Object.entries(forget).forEach(([id, sources]) => {
    const kept = { ...merged[id] };
    sources.forEach((source) => delete kept[source]);
    merged[id] = kept;
  });

  Object.entries(resolved).forEach(([id, tags]) => {
    merged[id] = { ...merged[id], ...tags };
  });

  const sorted = Object.fromEntries(
    Object.entries(merged)
      .filter(([, tags]) => Object.keys(tags).length > 0)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

  const target = tagFile();
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(sorted, null, 2)}\n`, 'utf-8');
};
