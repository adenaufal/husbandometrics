import { Character, HistoricalSnapshot, TimePeriod } from '../types';

export const getSnapshotsForPeriod = (character: Character, period: TimePeriod): HistoricalSnapshot[] => {
  return (character.history || []).filter((entry) => entry.period === period);
};

export const getLatestSnapshot = (character: Character, period: TimePeriod): HistoricalSnapshot | null => {
  const snapshots = getSnapshotsForPeriod(character, period);
  if (!snapshots.length) return null;
  return snapshots[snapshots.length - 1];
};

export const getScoreForPeriod = (character: Character, period: TimePeriod): number => {
  const latest = getLatestSnapshot(character, period);
  if (latest) return latest.weighted_total;
  return character.weighted_total;
};
