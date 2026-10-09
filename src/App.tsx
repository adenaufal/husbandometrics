import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LANGUAGE_LABELS, SupportedLanguage, TranslationProvider } from './lib/i18n';
import { BoardProvider } from './lib/board-context';
import Board from './components/Board';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LANGUAGE_KEY = 'husbandometrics-lang';

// Read during the first render, not in an effect: StrictMode runs effects twice
// in development, and the save below used to overwrite the stored choice with
// 'en' before the second pass could read it back.
const initialLanguage = (): SupportedLanguage => {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored && stored in LANGUAGE_LABELS ? (stored as SupportedLanguage) : 'en';
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider language={language} onChangeLanguage={setLanguage}>
        <BoardProvider>
          <Board />
        </BoardProvider>
      </TranslationProvider>
    </QueryClientProvider>
  );
};

export default App;
