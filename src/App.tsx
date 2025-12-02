import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { SourceType, Character, TimePeriod } from './types';
import { MOCK_CHARACTERS } from './lib/constants';
import Header from './components/Header';
import CharacterCard from './components/CharacterCard';
import DetailModal from './components/DetailModal';
import FilterBar from './components/FilterBar';
import Footer from './components/Footer';
import AboutModal from './components/AboutModal';
import ComparisonPanel from './components/ComparisonPanel';
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

const AppContent: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [filterType, setFilterType] = useState<SourceType>(SourceType.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.WEEK);
  const [franchise, setFranchise] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const franchises = useMemo(() => {
    const unique = new Set<string>();
    MOCK_CHARACTERS.forEach((char) => {
      if (char.franchise) unique.add(char.franchise);
      else unique.add(char.source);
    });
    return Array.from(unique).sort();
  }, []);

  const periodScores = useMemo(() => {
    const scores = new Map<string, number>();
    MOCK_CHARACTERS.forEach((char) => {
      scores.set(char.id, getScoreForPeriod(char, timePeriod));
    });
    return scores;
  }, [timePeriod]);

  // Filtering Logic
  const filteredCharacters = useMemo(() => {
    return MOCK_CHARACTERS.filter((char) => {
      const matchesType = filterType === SourceType.ALL || char.source_type === filterType;
      const matchesFranchise = franchise === 'ALL' || (char.franchise || char.source) === franchise;
      const withinScoreRange = (() => {
        const score = periodScores.get(char.id) ?? char.weighted_total;
        return score >= minScore && score <= maxScore;
      })();
      const matchesSearch = matchesQuery(char, searchQuery);
      return matchesType && matchesFranchise && matchesSearch && withinScoreRange;
    }).sort((a, b) => a.rank - b.rank);
  }, [filterType, franchise, searchQuery, minScore, maxScore, periodScores]);

  const handleResetFilters = () => {
    setFilterType(SourceType.ALL);
    setSearchQuery('');
    setFranchise('ALL');
    setMinScore(0);
    setMaxScore(100);
    setTimePeriod(TimePeriod.WEEK);
  };

  const toggleComparison = (character: Character) => {
    setComparisonIds((prev) => {
      if (prev.includes(character.id)) {
        return prev.filter((id) => id !== character.id);
      }
      if (prev.length >= 4) return prev; // avoid overcrowding
      return [...prev, character.id];
    });
  };

  const comparisonCharacters = useMemo(
    () => MOCK_CHARACTERS.filter((char) => comparisonIds.includes(char.id)),
    [comparisonIds]
  );

  return (
    <div className="min-h-screen relative font-mplus flex flex-col">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
         <div className="absolute top-20 -left-10 w-64 h-64 rounded-full bg-pink-200 opacity-30 blur-3xl animate-pulse"></div>
         <div className="absolute bottom-20 -right-10 w-80 h-80 rounded-full bg-blue-200 opacity-30 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
         <div className="absolute top-1/2 left-1/4 text-gray-200/50 text-9xl font-black rotate-12 select-none font-display animate-float">DATA</div>
         <div className="absolute top-40 right-20 text-gray-200/50 text-6xl font-black -rotate-6 select-none font-display animate-float" style={{animationDelay: '1.5s'}}>LOVE</div>
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
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 animate-fade-in-up">
                <div className="relative pl-2">
                    <h2 className="text-4xl font-black text-slate-800 font-display flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-tech-pink" />
                        CURRENT CHARTS
                    </h2>
                    <p className="text-slate-500 font-bold ml-11">Global aggregation from Pixiv, AO3 & Socials</p>
                </div>
                <FilterBar
                  currentFilter={filterType}
                  onFilterChange={setFilterType}
                  franchises={franchises}
                  selectedFranchise={franchise}
                  onFranchiseChange={setFranchise}
                  timePeriod={timePeriod}
                  onTimePeriodChange={setTimePeriod}
                  minScore={minScore}
                  maxScore={maxScore}
                  onScoreRangeChange={(min, max) => {
                    setMinScore(Math.max(0, Math.min(min, 100)));
                    setMaxScore(Math.max(min, Math.min(max, 100)));
                  }}
                />
            </div>

            <ComparisonPanel
              characters={comparisonCharacters}
              timePeriod={timePeriod}
              onClear={() => setComparisonIds([])}
            />

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-12">
                {filteredCharacters.length > 0 ? (
                filteredCharacters.map((char) => (
                    <div key={char.id} className="animate-fade-in-up">
                        <CharacterCard
                            character={char}
                            displayScore={periodScores.get(char.id) ?? char.weighted_total}
                            onClick={setSelectedCharacter}
                            onToggleCompare={toggleComparison}
                            isCompared={comparisonIds.includes(char.id)}
                        />
                    </div>
                ))
                ) : (
                <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-fade-in-up">
                    <p className="text-2xl font-black text-slate-300 font-display uppercase">No Matches Found</p>
                    <button
                    onClick={handleResetFilters}
                    className="mt-4 text-tech-pink hover:underline font-bold"
                    >
                    Reset System
                    </button>
                </div>
                )}
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
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
