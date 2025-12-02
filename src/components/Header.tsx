import React from 'react';
import { Heart, Search, Zap } from 'lucide-react';
import { SourceType } from '../types';
import { useTranslation } from '../lib/i18n';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onResetFilters }) => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-6 left-0 right-0 z-40 flex justify-center px-4 animate-fade-in-up">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700 rounded-full shadow-lg shadow-slate-200/20 px-3 py-2.5 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/30 hover:scale-[1.005]">

        {/* Logo Section */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={onResetFilters}>
          <div className="bg-gradient-to-tr from-tech-pink to-soft-pink p-2 rounded-full shadow-md group-hover:rotate-12 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white fill-current animate-pulse" />
          </div>
          <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white leading-none font-display group-hover:text-tech-pink transition-colors">
                  HUSBANDOMETRICS
              </h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">Popularity Tracker v2.0</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-2 pr-1">
           <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm font-bold text-slate-600 dark:text-white focus:outline-none focus:border-tech-pink/50 focus:bg-white/80 focus:ring-0 transition-all w-48 placeholder:text-slate-300 dark:placeholder:text-slate-500 group-hover:w-64"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-tech-pink transition-colors" />
           </div>

           <button className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-tech-pink transition-colors hover:scale-110 active:scale-95 shadow-md">
               <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
