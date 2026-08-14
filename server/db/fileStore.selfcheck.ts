/**
 * Runnable check for the snapshot file, which is the only history the static
 * deploy has. Silent corruption here loses a year of readings and shows up as a
 * trend arrow pointing the wrong way, so the round trip is worth asserting.
 *
 * Runs in a temp directory: the store resolves its path from process.cwd().
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { appendSnapshots, readSnapshots } from './fileStore';
import type { PersistedMetrics } from './repository';

const row = (id: string, total: number, recordedAt: string): PersistedMetrics => ({
  character_id: id,
  anilist: 50,
  mal: null,
  ao3: 60,
  danbooru: 70,
  weighted_total: total,
  recorded_at: new Date(recordedAt),
});

const run = async () => {
  const cwd = process.cwd();
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'husbandometrics-'));
  process.chdir(temp);

  try {
    // Missing file reads as empty rather than throwing.
    assert.deepEqual(await readSnapshots(['levi']), {});

    await appendSnapshots([row('levi', 90, '2026-01-05T04:00:00Z'), row('xiao', 80, '2026-01-05T04:00:00Z')]);
    let stored = await readSnapshots(['levi', 'xiao']);
    assert.equal(stored.levi.length, 1);
    assert.equal(stored.xiao.length, 1);

    // A second run on the same day replaces, so a hand-triggered refresh cannot
    // weight that day's average by how often someone pressed the button.
    await appendSnapshots([row('levi', 95, '2026-01-05T18:00:00Z')]);
    stored = await readSnapshots(['levi']);
    assert.equal(stored.levi.length, 1, 'same-day rows must replace, not accumulate');
    assert.equal(stored.levi[0].weighted_total, 95);

    // A later day accumulates, newest first, so [0] is current and [1] is what
    // the trend compares against.
    await appendSnapshots([row('levi', 88, '2026-01-12T04:00:00Z')]);
    stored = await readSnapshots(['levi']);
    assert.equal(stored.levi.length, 2);
    assert.equal(stored.levi[0].weighted_total, 88, 'newest first');
    assert.equal(stored.levi[1].weighted_total, 95);
    assert.ok(stored.levi[0].recorded_at instanceof Date, 'dates must survive the round trip');

    // Only the requested characters come back.
    assert.deepEqual(Object.keys(await readSnapshots(['xiao'])), ['xiao']);

    // The file is capped per character, keeping the most recent readings.
    for (let week = 0; week < 110; week += 1) {
      const day = new Date(Date.UTC(2027, 0, 1) + week * 7 * 86_400_000).toISOString();
      await appendSnapshots([row('levi', week, day)]);
    }
    stored = await readSnapshots(['levi']);
    assert.ok(stored.levi.length <= 104, `history should be capped, got ${stored.levi.length}`);
    assert.equal(stored.levi[0].weighted_total, 109, 'the cap must drop the oldest, not the newest');

    console.log('fileStore selfcheck OK');
  } finally {
    process.chdir(cwd);
    await fs.rm(temp, { recursive: true, force: true });
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
