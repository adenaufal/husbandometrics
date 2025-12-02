import React, { useState, useMemo } from 'react';
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
                <FilterBar currentFilter={filterType} onFilterChange={setFilterType} />
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
