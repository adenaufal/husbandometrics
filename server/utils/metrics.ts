import { METRIC_SOURCES, type MetricSourceId, type ScoreBreakdown } from '../../src/types';

/**
 * Scores are relative to the busiest character in the same roster, on a log
 * scale.
 *
 * Two reasons for the shape. Relative, because these counts have no natural
 * ceiling - a fixed divisor would need re-tuning every time a franchise blows
 * up, and would silently pin everyone at 100 or squash them near 0. Log,
 * because the distributions are heavy-tailed: AniList's top character has
 * roughly 200x the favourites of the median tracked one, and on a linear scale
 * that leaves every character below the top few indistinguishable.
 *
 * 100 therefore means "the most measured on this source", not "the maximum
 * possible".
 */
export const normalizeAgainstPeak = (value: number | null, peak: number): number | null => {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  if (!Number.isFinite(peak) || peak <= 0) return null;
  const score = (100 * Math.log1p(value)) / Math.log1p(peak);
  return Number(Math.max(0, Math.min(100, score)).toFixed(2));
};

/** The highest reading per source across the roster, used as each peak. */
export const peaksBySource = (readings: Array<Partial<Record<MetricSourceId, number | null>>>) => {
  const peaks = Object.fromEntries(METRIC_SOURCES.map((source) => [source, 0])) as Record<
    MetricSourceId,
    number
  >;

  readings.forEach((reading) => {
    METRIC_SOURCES.forEach((source) => {
      const value = reading[source];
      if (typeof value === 'number' && Number.isFinite(value) && value > peaks[source]) {
        peaks[source] = value;
      }
    });
  });

  return peaks;
};

/**
 * Weighted mean over the sources that actually returned a reading, with the
 * weights renormalized across them.
 *
 * Treating an absent source as zero would punish a character for the gaps in a
 * catalogue rather than for their popularity - AniList barely tracks game
 * characters, so Zhongli would be scored near zero on a source that never had
 * an opinion about him.
 */
export const weightedTotal = (
  scores: ScoreBreakdown,
  weights: Record<MetricSourceId, number>,
): number | null => {
  let weighted = 0;
  let totalWeight = 0;

  METRIC_SOURCES.forEach((source) => {
    const score = scores[source];
    const weight = weights[source];
    if (score === null || !Number.isFinite(score) || !weight) return;
    weighted += score * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return null;
  return Number((weighted / totalWeight).toFixed(2));
};

export const measuredSources = (scores: ScoreBreakdown): MetricSourceId[] =>
  METRIC_SOURCES.filter((source) => scores[source] !== null);
