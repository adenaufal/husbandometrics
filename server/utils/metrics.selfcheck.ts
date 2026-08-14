/**
 * Smallest runnable guard for the scoring path. Run with `npm run check`.
 *
 * Two properties matter here, and both have already been broken once:
 *   1. A source with no reading must not be scored as zero. AniList barely
 *      tracks game characters, so counting an absent source as zero drags every
 *      gacha husbando to the bottom for a reason that has nothing to do with
 *      popularity.
 *   2. Scores are relative to the roster peak, so the busiest character on a
 *      source must land on 100 and ordering must survive normalization.
 */
import assert from 'node:assert/strict';
import { METRIC_SOURCES, type ScoreBreakdown } from '../../src/types';
import { measuredSources, normalizeAgainstPeak, peaksBySource, weightedTotal } from './metrics';

const WEIGHTS = { anilist: 0.35, mal: 0.25, ao3: 0.2, danbooru: 0.2 };

// --- normalizeAgainstPeak ---------------------------------------------------
assert.equal(normalizeAgainstPeak(43001, 43001), 100, 'roster peak scores 100');
assert.equal(normalizeAgainstPeak(0, 43001), 0, 'a measured zero is still zero');
assert.equal(normalizeAgainstPeak(null, 43001), null, 'no reading stays null');
assert.equal(normalizeAgainstPeak(100, 0), null, 'no peak means nothing is comparable');

// Log scale: ordering is preserved and the mid-range stays distinguishable.
const low = normalizeAgainstPeak(1_000, 43_001)!;
const mid = normalizeAgainstPeak(10_000, 43_001)!;
const high = normalizeAgainstPeak(40_000, 43_001)!;
assert.ok(low < mid && mid < high, `ordering broken: ${low}, ${mid}, ${high}`);
assert.ok(low > 5, `log scale should keep small values legible, got ${low}`);

// --- peaksBySource ----------------------------------------------------------
const peaks = peaksBySource([
  { anilist: 43001, mal: 200000, ao3: 58111, danbooru: 2537 },
  { anilist: null, mal: null, ao3: 40215, danbooru: 10149 },
]);
assert.equal(peaks.anilist, 43001);
assert.equal(peaks.danbooru, 10149, 'peak comes from whichever character measured highest');

// --- weightedTotal ----------------------------------------------------------
const full: ScoreBreakdown = { anilist: 100, mal: 100, ao3: 100, danbooru: 100 };
assert.equal(weightedTotal(full, WEIGHTS), 100);

// A game character measured only by AO3 and Danbooru is scored on those alone,
// not punished for the two catalogues that never had an opinion about him.
const gameOnly: ScoreBreakdown = { anilist: null, mal: null, ao3: 80, danbooru: 90 };
assert.equal(weightedTotal(gameOnly, WEIGHTS), 85, 'weights renormalize over measured sources');

const zeroed: ScoreBreakdown = { anilist: 0, mal: 0, ao3: 80, danbooru: 90 };
assert.ok(
  weightedTotal(gameOnly, WEIGHTS)! > weightedTotal(zeroed, WEIGHTS)!,
  'absent must score higher than measured-zero, or null is being treated as 0',
);

const nothing: ScoreBreakdown = { anilist: null, mal: null, ao3: null, danbooru: null };
assert.equal(weightedTotal(nothing, WEIGHTS), null, 'unmeasurable characters stay off the board');

// --- measuredSources --------------------------------------------------------
assert.deepEqual(measuredSources(gameOnly), ['ao3', 'danbooru']);
assert.deepEqual(measuredSources(full), [...METRIC_SOURCES]);

console.log('metrics selfcheck OK');
