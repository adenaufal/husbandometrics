/**
 * Reads every source and writes the board to `public/rankings.json`.
 *
 * This is what production serves. The site is a weekly ranking with no
 * per-visitor state and no writes, so it does not need a live API: a scheduled
 * job runs this, commits the result, and the host serves a static file. That
 * also sidesteps the shape of the work — a cold read takes minutes, which no
 * serverless request timeout will tolerate.
 *
 * Run with `npm run snapshot`.
 */
import fs from 'fs/promises';
import path from 'path';
import { refreshRankings } from '../server/services/aggregator';

const OUTPUT = path.join(process.cwd(), 'public', 'rankings.json');

const run = async () => {
  const startedAt = Date.now();
  console.log('[snapshot] reading sources…');

  const payload = await refreshRankings();

  const measured = payload.metadata.sources.map((source) => {
    const count = payload.characters.filter((character) => character.counts[source] !== null).length;
    return `${source} ${count}/${payload.characters.length}`;
  });

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');

  console.log(`[snapshot] ${payload.characters.length} characters ranked`);
  console.log(`[snapshot] coverage: ${measured.join(', ')}`);
  console.log(`[snapshot] wrote ${path.relative(process.cwd(), OUTPUT)} in ${Math.round((Date.now() - startedAt) / 1000)}s`);

  // A refresh that measured almost nothing is worse than keeping last week's
  // file, so fail loudly rather than committing a hollowed-out board.
  if (payload.characters.length < 10) {
    throw new Error(`Only ${payload.characters.length} characters could be ranked; refusing to publish`);
  }
};

run().catch((error) => {
  console.error('[snapshot] failed:', error);
  process.exit(1);
});
