import React, { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Character, MetricSourceId, SourceType, TimePeriod } from './types';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import RankingTable from './components/RankingTable';
import DetailPanel from './components/DetailPanel';
import MethodologyModal from './components/MethodologyModal';
import Footer from './components/Footer';
import { SupportedLanguage, TranslationProvider, useTranslation } from './lib/i18n';
import { matchesQuery } from './lib/search';
import { getScoreForPeriod } from './lib/history';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

type RankingsResponse = {
  metadata: {
    updated_at: string;
    weights: Record<MetricSourceId, number>;
    sources: MetricSourceId[];
    roster: { anime: number; game: number };
    mode: string;
  };
  characters: Character[];
};

interface AppContentProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const AppContent: React.FC<AppContentProps> = ({ language, onLanguageChange }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Character | null>(null);
  const [isMethodologyOpen, setMethodologyOpen] = useState(false);
  const [filterType, setFilterType] = useState<SourceType>(SourceType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.WEEK);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );

  // A committed file by default. The board is a weekly measurement with no
  // per-visitor state, so production serves it statically and never waits on an
  // upstream read. Point this at /api/rankings to develop against the live API.
  const rankingsUrl = import.meta.env.VITE_RANKINGS_URL ?? '/rankings.json';

  const { data, isLoading, isError, refetch, isFetching } = useQuery<RankingsResponse>({
    queryKey: ['rankings', rankingsUrl],
    queryFn: async () => {
      const response = await fetch(rankingsUrl);
      if (!response.ok) throw new Error('Failed to fetch rankings');
      return response.json();
    },
  });

  // No sample-data fallback: every figure on the board is a live reading, so an
  // unreachable API shows an error rather than an invented ranking.
  const characters = data?.characters ?? [];

  useEffect(() => {
    const stored = localStorage.getItem('husbandometrics-theme');
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('husbandometrics-theme', theme);
  }, [theme]);

  const scoreFor = useMemo(() => {
    const cache = new Map<string, number>();
    characters.forEach((character) => {
      cache.set(character.id, getScoreForPeriod(character, timePeriod));
    });
    return (character: Character) => cache.get(character.id) ?? character.weighted_total;
  }, [characters, timePeriod]);

  const filtered = useMemo(
    () =>
      characters
        .filter((character) => {
          const score = scoreFor(character);
          return (
            (filterType === SourceType.ALL || character.source_type === filterType) &&
            score >= minScore &&
            score <= maxScore &&
            matchesQuery(character, searchQuery)
          );
        })
        .sort((a, b) => a.rank - b.rank),
    [characters, filterType, searchQuery, minScore, maxScore, scoreFor],
  );

  const hasFilters =
    filterType !== SourceType.ALL ||
    searchQuery !== '' ||
    minScore !== 0 ||
    maxScore !== 100 ||
    timePeriod !== TimePeriod.WEEK;

  const clearFilters = () => {
    setFilterType(SourceType.ALL);
    setSearchQuery('');
    setMinScore(0);
    setMaxScore(100);
    setTimePeriod(TimePeriod.WEEK);
  };

  const exportCsv = () => {
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={clearFilters}
        theme={theme}
        onToggleTheme={() => setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4">
        {/* The panel column only exists once something is selected; reserving it
            permanently squeezed the ranking into two thirds of the page and
            truncated most of the names. */}
        <div
          className={`grid lg:gap-8 ${selected ? 'lg:grid-cols-[minmax(0,1fr)_380px]' : 'grid-cols-1'}`}
        >
          <div className="min-w-0">
            <div className="pt-8 pb-2">
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">
                {t('boardTitle')}
              </h1>
              <p className="mt-1 text-muted-light dark:text-muted-dark">{t('boardSubtitle')}</p>
            </div>

            {isError && (
              <div className="my-4 flex items-start gap-3 rounded-lg border border-falling/30 bg-falling/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-falling" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-bold">{t('apiDownTitle')}</p>
                  <p className="text-sm text-muted-light dark:text-muted-dark">{t('apiDownBody')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="shrink-0 text-sm font-bold hover:underline disabled:opacity-50"
                >
                  {isFetching ? t('retrying') : t('retry')}
                </button>
              </div>
            )}

            {/* Sticky only from sm up: on phones the header wraps to two rows,
                so a fixed top offset would leave a gap or overlap. */}
            <div className="sm:sticky sm:top-16 z-20 bg-paper-light/85 dark:bg-paper-dark/85 backdrop-blur">
              <Toolbar
                filterType={filterType}
                onFilterChange={setFilterType}
                timePeriod={timePeriod}
                onTimePeriodChange={setTimePeriod}
                minScore={minScore}
                maxScore={maxScore}
                onScoreRangeChange={(min, max) => {
                  setMinScore(min);
                  setMaxScore(max);
                }}
                onExportCsv={exportCsv}
                hasFilters={hasFilters}
                onClearFilters={clearFilters}
                resultCount={filtered.length}
              />
            </div>

            <RankingTable
              characters={filtered}
              scoreFor={scoreFor}
              selectedId={selected?.id ?? null}
              onSelect={(character) =>
                setSelected((current) => (current?.id === character.id ? null : character))
              }
              isLoading={isLoading}
              onClearFilters={clearFilters}
            />
          </div>

          {/* On wide screens the panel is a column beside the board; below that
              it overlays, so the ranking never has to shrink to make room. */}
          {selected && (
            <DetailPanel
              character={selected}
              onClose={() => setSelected(null)}
              timePeriod={timePeriod}
            />
          )}
        </div>
      </main>

      <Footer
        onOpenMethodology={() => setMethodologyOpen(true)}
        updatedAt={data?.metadata.updated_at}
      />

      {isMethodologyOpen && (
        <MethodologyModal
          onClose={() => setMethodologyOpen(false)}
          weights={data?.metadata.weights}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const stored = localStorage.getItem('husbandometrics-lang') as SupportedLanguage | null;
    if (stored) setLanguage(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('husbandometrics-lang', language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider language={language} onChangeLanguage={setLanguage}>
        <AppContent language={language} onLanguageChange={setLanguage} />
      </TranslationProvider>
    </QueryClientProvider>
  );
};

export default App;
