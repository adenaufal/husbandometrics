import React, { useState, useMemo, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { SourceType, Character } from './types';
import { MOCK_CHARACTERS } from './lib/constants';
import Header from './components/Header';
import CharacterCard from './components/CharacterCard';
import DetailModal from './components/DetailModal';
import FilterBar from './components/FilterBar';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import UtilityBar from './components/UtilityBar';
import CharacterRequestPanel, { CharacterRequest } from './components/CharacterRequestPanel';
import IntegrationStatus, { IntegrationStat } from './components/IntegrationStatus';
import { TranslationProvider, SupportedLanguage, useTranslation } from './lib/i18n';

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
  const { t } = useTranslation();

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

  // Filtering Logic
  const filteredCharacters = useMemo(() => {
    return MOCK_CHARACTERS.filter((char) => {
      const matchesType = filterType === SourceType.ALL || char.source_type === filterType;
      const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            char.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => a.rank - b.rank);
  }, [filterType, searchQuery]);

  const handleResetFilters = () => {
    setFilterType(SourceType.ALL);
    setSearchQuery('');
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
      <div className="min-h-screen relative font-mplus flex flex-col bg-app-bg dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
         <div className="absolute top-20 -left-10 w-64 h-64 rounded-full bg-pink-200 dark:bg-pink-500 opacity-30 blur-3xl animate-pulse"></div>
         <div className="absolute bottom-20 -right-10 w-80 h-80 rounded-full bg-blue-200 dark:bg-blue-600 opacity-30 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
         <div className="absolute top-1/2 left-1/4 text-gray-200/50 dark:text-slate-800 text-9xl font-black rotate-12 select-none font-display animate-float">DATA</div>
         <div className="absolute top-40 right-20 text-gray-200/50 dark:text-slate-800 text-6xl font-black -rotate-6 select-none font-display animate-float" style={{animationDelay: '1.5s'}}>LOVE</div>
      </div>

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 flex-grow w-full">

            {/* Filter Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-6 animate-fade-in-up">
                <div className="relative pl-2">
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white font-display flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-tech-pink" />
                        {t('currentCharts').toUpperCase()}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold ml-11">{t('globalAggregation')}</p>
                </div>
                <FilterBar currentFilter={filterType} onFilterChange={setFilterType} />
            </div>

            <div className="mb-10">
              <UtilityBar
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                language={language}
                onLanguageChange={onLanguageChange}
                theme={theme}
                onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
                {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => (
                    <div key={char.id} className="animate-fade-in-up">
                        <CharacterCard
                            character={char}
                            onClick={setSelectedCharacter}
                        />
                    </div>
                ))
                ) : (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-fade-in-up">
                    <p className="text-2xl font-black text-slate-300 font-display uppercase">{t('noMatches')}</p>
                    <button
                    onClick={handleResetFilters}
                    className="mt-4 text-tech-pink hover:underline font-bold"
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
