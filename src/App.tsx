import React, { useState, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { SourceType, Character, TimePeriod, ScoreBreakdown } from './types';
import { MOCK_CHARACTERS } from './lib/constants';
import Header from './components/Header';
import CharacterCard from './components/CharacterCard';
import DetailModal from './components/DetailModal';
import Controls from './components/Controls';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import CharacterRequestPanel, { CharacterRequest } from './components/CharacterRequestPanel';
import IntegrationStatus, { IntegrationStat } from './components/IntegrationStatus';
import { TranslationProvider, SupportedLanguage, useTranslation } from './lib/i18n';
import { matchesQuery } from './lib/search';
import { getScoreForPeriod } from './lib/history';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface AppContentProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

type RankingsResponse = {
  metadata: {
    updated_at: string;
    weights: ScoreBreakdown;
    mode: string;
  };
  characters: Character[];
};

const AppContent: React.FC<AppContentProps> = ({ language, onLanguageChange }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [filterType, setFilterType] = useState<SourceType>(SourceType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [requests, setRequests] = useState<CharacterRequest[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStat[]>([
    { id: 'mal', service: 'MAL', syncedAt: new Date().toISOString(), characters: 1200, latencyMs: 182, status: 'healthy' },
    { id: 'anilist', service: 'AniList', syncedAt: new Date().toISOString(), characters: 980, latencyMs: 234, status: 'warning' },
  ]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.WEEK);
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const { t } = useTranslation();
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

  const { data, isLoading, isError } = useQuery<RankingsResponse>({
    queryKey: ['rankings'],
    queryFn: async () => {
      const response = await fetch(`${apiBase}/api/rankings`);
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      return response.json();
    },
  });

  const characters = useMemo(() => data?.characters ?? MOCK_CHARACTERS, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('husbandometrics-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('husbandometrics-theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
    }
  }, []);

  const periodScores = useMemo(() => {
    const scores = new Map<string, number>();
    characters.forEach((char) => {
      scores.set(char.id, getScoreForPeriod(char, timePeriod));
    });
    return scores;
  }, [characters, timePeriod]);

  // Filtering Logic
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesType = filterType === SourceType.ALL || char.source_type === filterType;
      const withinScoreRange = (() => {
        const score = periodScores.get(char.id) ?? char.weighted_total;
        return score >= minScore && score <= maxScore;
      })();
      const matchesSearch = matchesQuery(char, searchQuery);
      return matchesType && matchesSearch && withinScoreRange;
    }).sort((a, b) => a.rank - b.rank);
  }, [characters, filterType, searchQuery, minScore, maxScore, periodScores]);

  const handleResetFilters = () => {
    setFilterType(SourceType.ALL);
    setSearchQuery('');
    setMinScore(0);
    setMaxScore(100);
    setTimePeriod(TimePeriod.WEEK);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredCharacters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'husbandometrics-rankings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const header = ['rank', 'id', 'name', 'source', 'type', 'total', 'trend'];
    const rows = filteredCharacters.map((char) => [
      char.rank,
      char.id,
      char.name,
      char.source,
      char.source_type,
      char.weighted_total,
      char.trend,
    ]);
    const csv = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'husbandometrics-rankings.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddRequest = (text: string) => {
    const entry: CharacterRequest = {
      id: (requests.length + 1).toString().padStart(3, '0'),
      text,
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [entry, ...prev]);
  };

  const handleSyncIntegrations = () => {
    setIntegrations((prev) =>
      prev.map((integration) => ({
        ...integration,
        syncedAt: new Date().toISOString(),
        latencyMs: Math.max(140, Math.round(Math.random() * 300)),
      })),
    );
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 min-h-screen flex flex-col">

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {isError && (
          <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="material-icons-round text-amber-600 dark:text-amber-500 text-sm mt-0.5">warning</span>
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Live API unreachable; showing sample data instead.</p>
          </div>
        )}

        <Controls
          currentFilter={filterType}
          onFilterChange={setFilterType}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
          minScore={minScore}
          maxScore={maxScore}
          onScoreRangeChange={(min, max) => {
            setMinScore(min);
            setMaxScore(max);
          }}
          onExportCsv={handleExportCsv}
        />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((char, index) => (
              <CharacterCard
                key={char.id}
                character={char}
                displayScore={periodScores.get(char.id) ?? char.weighted_total}
                onClick={setSelectedCharacter}
                layout={index === 0 ? 'featured' : index < 3 ? 'large' : 'standard'}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="text-2xl font-bold text-slate-400">{t('noMatches')}</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-primary hover:underline font-bold"
              >
                {t('resetSystem')}
              </button>
            </div>
          )}
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              <CharacterRequestPanel requests={requests} onAddRequest={handleAddRequest} />
              <IntegrationStatus integrations={integrations} onSync={handleSyncIntegrations} />
            </div>
      </main>

      <Footer onOpenAbout={() => setIsAboutOpen(true)} />

      {/* Detail Modal */}
      {selectedCharacter && (
        <DetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          timePeriod={timePeriod}
        />
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <AboutModal onClose={() => setIsAboutOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('husbandometrics-lang') as SupportedLanguage | null;
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('husbandometrics-lang', language);
    }
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
