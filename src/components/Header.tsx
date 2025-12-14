import React from 'react';
import { Heart, Search, Zap, Sun, Moon } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onResetFilters, theme, onToggleTheme }) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={onResetFilters}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-none uppercase">Husbandometrics</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Popularity Tracker v3.0</p>
          </div>
        </div>
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </span>
            <input
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
              placeholder={t('searchPlaceholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            LIVE
          </span>
          <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-pink-600 transition-colors">
            <Zap className="w-4 h-4 fill-white" />
          </button>
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
                onClick={onToggleTheme}
                className={`p-1 rounded transition-colors ${theme === 'light' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                aria-label="Switch to light theme"
                disabled={theme === 'light'}
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={onToggleTheme}
                className={`p-1 rounded transition-colors ${theme === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                aria-label="Switch to dark theme"
                disabled={theme === 'dark'}
            >
                <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
