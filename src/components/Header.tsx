import React from 'react';
import { Moon, Search, Sun } from 'lucide-react';
import { LANGUAGE_LABELS, SupportedLanguage, useTranslation } from '../lib/i18n';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onResetFilters,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-paper-light/85 dark:bg-paper-dark/85 backdrop-blur border-b border-line-light dark:border-line-dark">
      {/* Search drops to its own line on phones. Sharing one row left it about
          40px wide, which is a button, not a search field. */}
      <div className="mx-auto max-w-[1400px] px-4 py-2 sm:h-16 sm:py-0 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="shrink-0 font-display font-black tracking-tight text-lg"
        >
          Husbando<span className="text-accent dark:text-accent-dark">metrics</span>
        </button>

        <div className="relative order-last sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light dark:text-muted-dark"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark text-sm placeholder:text-muted-light dark:placeholder:text-muted-dark"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* A native select: the language list is short, and the platform
              control is keyboard- and screen-reader-correct for free. */}
          <label className="sr-only" htmlFor="language">
            {t('language')}
          </label>
          <select
            id="language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}
            className="px-2 py-1.5 rounded-md bg-transparent text-sm font-bold text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark cursor-pointer"
          >
            {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((code) => (
              <option key={code} value={code} className="bg-surface-light dark:bg-surface-dark">
                {LANGUAGE_LABELS[code]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            className="p-2 rounded-md text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
