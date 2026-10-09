import {
  Character,
  METRIC_SOURCES,
  MetricSourceId,
  SourceType,
  TimePeriod,
} from '../types';
import { REMEASURED } from './remeasured';

/**
 * Figures derived from the published board itself. Every function here
 * recombines numbers that are already in rankings.json - none of them estimates
 * anything - so the board can show them without weakening the measurement
 * claim. The one outside input is lib/remeasured, the record of days the
 * measuring itself changed.
 */

export type Weights = Record<MetricSourceId, number>;

export const formatCount = (value: number) => value.toLocaleString('en-US');

export const typeCounts = (characters: Character[]) => {
  const counts: Record<SourceType, number> = {
    [SourceType.ALL]: characters.length,
    [SourceType.ANIME]: 0,
    [SourceType.MANGA]: 0,
    [SourceType.GAME]: 0,
  };
  characters.forEach((character) => {
    counts[character.source_type] += 1;
  });
  return counts;
};

// ---------------------------------------------------------------------------
// Peaks and the arithmetic behind a total

export interface SourcePeak {
  count: number;
  /**
   * The character holding the reading, or null when the peak belongs to someone
   * who was read but left off the board (fewer than two sources). The server
   * scores against the whole roster, so the board alone cannot always name them.
   */
  holder: Character | null;
}

export type BoardPeaks = Record<MetricSourceId, SourcePeak | null>;

export const boardPeaks = (characters: Character[]): BoardPeaks => {
  const peaks = {} as BoardPeaks;

  METRIC_SOURCES.forEach((source) => {
    let holder: Character | null = null;
    let count = -1;
    characters.forEach((character) => {
      const value = character.counts?.[source];
      if (typeof value === 'number' && Number.isFinite(value) && value > count) {
        count = value;
        holder = character;
      }
    });

    if (!holder) {
      peaks[source] = null;
      return;
    }

    const holderScore = (holder as Character).scores[source];
    if (holderScore === 100) {
      peaks[source] = { count, holder };
      return;
    }

    // Someone off the board holds the peak. Back-solve it from the highest
    // reading here; the scores are stored to two decimals, so this is close but
    // not exact, and the holder is unknown.
    peaks[source] =
      holderScore && holderScore > 0
        ? { count: Math.round(Math.expm1((100 * Math.log1p(count)) / holderScore)), holder: null }
        : null;
  });

  return peaks;
};

export interface SourceTerm {
  source: MetricSourceId;
  /** The raw upstream figure, e.g. 39,258 favourites. */
  count: number | null;
  /** 0-100, log-scaled against the source's peak. */
  score: number | null;
  peak: SourcePeak | null;
  /** The configured weight. */
  weight: number;
  /** The weight after renormalising across measured sources; null when unmeasured. */
  share: number | null;
  /** score x share: what this source adds to the total. */
  contribution: number | null;
}

export interface Arithmetic {
  terms: SourceTerm[];
  /** The published total. */
  total: number;
  /** The total rebuilt from the terms. */
  recomputed: number;
  /**
   * False when rebuilding the total does not land on the published one. A design
   * should then show the published figure without the sum, rather than print an
   * equation that does not add up.
   */
  consistent: boolean;
}

export const arithmeticFor = (
  character: Character,
  weights: Weights,
  peaks: BoardPeaks,
): Arithmetic => {
  const measuredWeight = METRIC_SOURCES.reduce(
    (sum, source) => (character.scores[source] === null ? sum : sum + (weights[source] ?? 0)),
    0,
  );

  const terms = METRIC_SOURCES.map((source): SourceTerm => {
    const score = character.scores[source];
    const weight = weights[source] ?? 0;
    const share = score === null || measuredWeight === 0 ? null : weight / measuredWeight;
    return {
      source,
      count: character.counts?.[source] ?? null,
      score,
      peak: peaks[source],
      weight,
      share,
      contribution: score === null || share === null ? null : score * share,
    };
  });

  const recomputed = terms.reduce((sum, term) => sum + (term.contribution ?? 0), 0);

  return {
    terms,
    total: character.weighted_total,
    recomputed,
    consistent: Math.abs(recomputed - character.weighted_total) < 0.05,
  };
};

// ---------------------------------------------------------------------------
// History, movement and the previous board

export interface SeriesPoint {
  label: string;
  date: Date;
  total: number;
  scores: Character['scores'];
}

/** One reading per refresh day, oldest first. */
export const readingSeries = (character: Character): SeriesPoint[] =>
  (character.history ?? [])
    .filter((entry) => entry.period === TimePeriod.WEEK)
    .map((entry) => ({
      label: entry.label,
      date: new Date(`${entry.label}T00:00:00Z`),
      total: entry.weighted_total,
      scores: entry.scores,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

export type MovementStatus = 'ranked' | 'returning' | 'new' | 'remeasured';

export interface Remeasured {
  label: string;
  sources: MetricSourceId[];
}

/** The days this character was re-measured (lib/remeasured), oldest first. */
export const remeasurementsFor = (id: string): Remeasured[] =>
  REMEASURED.flatMap(({ label, characters }) =>
    characters[id] ? [{ label, sources: [...characters[id]] }] : [],
  ).sort((a, b) => a.label.localeCompare(b.label));

export interface Movement {
  /** Rank on the previous refresh's board, or null if they were not on it. */
  previousRank: number | null;
  status: MovementStatus;
  /**
   * Change in total since this character's previous reading. Null when there
   * is none, or when it was taken another way.
   */
  delta: number | null;
  /** Set when the character was re-measured since their previous reading. */
  remeasured: Remeasured | null;
}

export interface BoardMovement {
  /** The refresh before the current one, e.g. "2026-09-28". */
  previousLabel: string | null;
  currentLabel: string | null;
  byId: Map<string, Movement>;
  /** Someone on the board was re-measured since their previous reading. */
  anyRemeasured: boolean;
}

/**
 * Last week's rank, rebuilt from the history every character carries.
 *
 * Checked against the board actually published on 2026-09-28: all 91 ranks
 * matched. A character absent from that board is "returning" if they have an
 * earlier reading and "new" if they have none - not "unranked", which would
 * read as a judgement rather than a gap. One re-measured since their previous
 * reading is "remeasured", and their change is not given: Luffy went from 93rd
 * to 1st on 2026-10-09 because his tags were corrected, not because he surged.
 */
export const boardMovement = (characters: Character[]): BoardMovement => {
  const labels = new Set<string>();
  characters.forEach((character) =>
    readingSeries(character).forEach((point) => labels.add(point.label)),
  );
  const ordered = [...labels].sort();
  const currentLabel = ordered[ordered.length - 1] ?? null;
  const previousLabel = ordered[ordered.length - 2] ?? null;

  const previousRanks = new Map<string, number>();
  if (previousLabel) {
    characters
      .map((character) => ({
        id: character.id,
        total: readingSeries(character).find((point) => point.label === previousLabel)?.total,
      }))
      .filter((entry): entry is { id: string; total: number } => entry.total !== undefined)
      .sort((a, b) => b.total - a.total)
      .forEach((entry, index) => previousRanks.set(entry.id, index + 1));
  }

  const byId = new Map<string, Movement>();
  characters.forEach((character) => {
    const series = readingSeries(character);
    const previousReading = series[series.length - 2];
    const latestReading = series[series.length - 1];
    const previousRank = previousRanks.get(character.id) ?? null;
    const remeasured =
      (previousReading &&
        remeasurementsFor(character.id).find(
          ({ label }) => label > previousReading.label && label <= latestReading.label,
        )) ||
      null;

    byId.set(character.id, {
      previousRank,
      status: remeasured
        ? 'remeasured'
        : previousRank !== null
          ? 'ranked'
          : series.length > 1
            ? 'returning'
            : 'new',
      delta:
        previousReading && !remeasured ? character.weighted_total - previousReading.total : null,
      remeasured,
    });
  });

  const anyRemeasured = [...byId.values()].some((movement) => movement.remeasured !== null);
  return { previousLabel, currentLabel, byId, anyRemeasured };
};

/**
 * The first refresh on which each source returned any reading. MyAnimeList was
 * only read from 2026-08-25, so totals before that are averaged over three
 * sources and jump when the fourth arrives. A history chart should mark that
 * date rather than let the jump read as a change in popularity.
 */
export const firstReadings = (characters: Character[]) => {
  const first = {} as Record<MetricSourceId, string | null>;
  let boardStart: string | null = null;

  METRIC_SOURCES.forEach((source) => {
    first[source] = null;
  });

  characters.forEach((character) =>
    readingSeries(character).forEach((point) => {
      if (!boardStart || point.label < boardStart) boardStart = point.label;
      METRIC_SOURCES.forEach((source) => {
        const current = first[source];
        if (point.scores[source] !== null && (!current || point.label < current)) {
          first[source] = point.label;
        }
      });
    }),
  );

  /** Sources that started after the board did, with the date they started. */
  const lateStarts = METRIC_SOURCES.filter(
    (source) => first[source] && boardStart && first[source]! > boardStart,
  ).map((source) => ({ source, label: first[source]! }));

  return { first, boardStart, lateStarts };
};

/**
 * One vertical scale for every sparkline on the board. Scaling each row to its
 * own range would draw a 0.2-point wobble as steeply as a 16-point fall.
 */
export const seriesDomain = (characters: Character[]): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  characters.forEach((character) =>
    readingSeries(character).forEach((point) => {
      min = Math.min(min, point.total);
      max = Math.max(max, point.total);
    }),
  );
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 100];
  return [Math.floor(min), Math.ceil(max)];
};

/** ISO-8601 week number, for an issue-style "No. 41" dateline. */
export const isoWeek = (date: Date) => {
  const day = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return {
    year: day.getUTCFullYear(),
    week: Math.ceil(((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
  };
};
