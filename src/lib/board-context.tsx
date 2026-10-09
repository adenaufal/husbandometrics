import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Character, MetricSourceId, SourceType, TimePeriod } from '../types';
import { matchesQuery } from './search';
import { getScoreForPeriod } from './history';
import {
  BoardMovement,
  BoardPeaks,
  boardMovement,
  boardPeaks,
  firstReadings,
  seriesDomain,
  typeCounts,
} from './board';

export type RankingsResponse = {
  metadata: {
    updated_at: string;
    weights: Record<MetricSourceId, number>;
    sources: MetricSourceId[];
    roster: { anime: number; game: number };
    mode: string;
  };
  characters: Character[];
};

interface BoardValue {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  metadata: RankingsResponse['metadata'] | undefined;
  /** The whole published board, in rank order. */
  characters: Character[];
  /** The board after filters and search, in rank order. */
  filtered: Character[];
  scoreFor: (character: Character) => number;

  filterType: SourceType;
  setFilterType: (type: SourceType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  minScore: number;
  maxScore: number;
  setScoreRange: (min: number, max: number) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  exportCsv: () => void;

  /** Derived from the whole board, never from the filtered view. */
  peaks: BoardPeaks;
  movement: BoardMovement;
  readings: ReturnType<typeof firstReadings>;
  domain: [number, number];
  counts: ReturnType<typeof typeCounts>;
}

const BoardContext = createContext<BoardValue | null>(null);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filterType, setFilterType] = useState<SourceType>(SourceType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.WEEK);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // A committed file by default. The board is a weekly measurement with no
  // per-visitor state, so production serves it statically and never waits on an
  // upstream read. Point this at /api/rankings to develop against the live API.
  const rankingsUrl = import.meta.env.VITE_RANKINGS_URL ?? '/rankings.json';

  // Development only: ?simulate=loading or ?simulate=error renders those states
  // on demand, so they get looked at rather than assumed.
  const simulate = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('simulate')
    : null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery<RankingsResponse>({
    queryKey: ['rankings', rankingsUrl, simulate],
    queryFn: async () => {
      if (simulate === 'loading') return new Promise<never>(() => {});
      if (simulate === 'error') throw new Error('Simulated failure');
      const response = await fetch(rankingsUrl);
      if (!response.ok) throw new Error('Failed to fetch rankings');
      return response.json();
    },
  });

  // No sample-data fallback: every figure on the board is a live reading, so an
  // unreachable API shows an error rather than an invented ranking.
  const characters = useMemo(
    () => [...(data?.characters ?? [])].sort((a, b) => a.rank - b.rank),
    [data],
  );

  const scoreFor = useMemo(() => {
    const cache = new Map<string, number>();
    characters.forEach((character) => {
      cache.set(character.id, getScoreForPeriod(character, timePeriod));
    });
    return (character: Character) => cache.get(character.id) ?? character.weighted_total;
  }, [characters, timePeriod]);

  const filtered = useMemo(
    () =>
      characters.filter((character) => {
        const score = scoreFor(character);
        return (
          (filterType === SourceType.ALL || character.source_type === filterType) &&
          score >= minScore &&
          score <= maxScore &&
          matchesQuery(character, searchQuery)
        );
      }),
    [characters, filterType, searchQuery, minScore, maxScore, scoreFor],
  );

  const derived = useMemo(
    () => ({
      peaks: boardPeaks(characters),
      movement: boardMovement(characters),
      readings: firstReadings(characters),
      domain: seriesDomain(characters),
      counts: typeCounts(characters),
    }),
    [characters],
  );

  const hasFilters =
    filterType !== SourceType.ALL ||
    searchQuery !== '' ||
    minScore !== 0 ||
    maxScore !== 100 ||
    timePeriod !== TimePeriod.WEEK;

  const clearFilters = useCallback(() => {
    setFilterType(SourceType.ALL);
    setSearchQuery('');
    setMinScore(0);
    setMaxScore(100);
    setTimePeriod(TimePeriod.WEEK);
  }, []);

  const setScoreRange = useCallback((min: number, max: number) => {
    setMinScore(min);
    setMaxScore(max);
  }, []);

  const exportCsv = useCallback(() => {
    const header = ['rank', 'id', 'name', 'franchise', 'type', 'score', 'trend', 'measured_sources'];
    const rows = filtered.map((character) => [
      character.rank,
      character.id,
      `"${character.name.replace(/"/g, '""')}"`,
      `"${character.source.replace(/"/g, '""')}"`,
      character.source_type,
      character.weighted_total,
      character.trend,
      `"${character.measured_sources.join(' ')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'husbandometrics-rankings.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const value: BoardValue = {
    isLoading,
    isError,
    isFetching,
    refetch: () => void refetch(),
    metadata: data?.metadata,
    characters,
    filtered,
    scoreFor,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    timePeriod,
    setTimePeriod,
    minScore,
    maxScore,
    setScoreRange,
    hasFilters,
    clearFilters,
    exportCsv,
    ...derived,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useBoard = () => {
  const value = useContext(BoardContext);
  if (!value) throw new Error('useBoard must be used inside <BoardProvider>');
  return value;
};
