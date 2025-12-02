import React from 'react';
import { SourceType } from '../types';
import { Filter, Grid3X3, List } from 'lucide-react';

interface FilterBarProps {
  currentFilter: SourceType;
  onFilterChange: (type: SourceType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  const tabs = [
    { label: 'ALL', value: SourceType.ALL },
    { label: 'ANIME', value: SourceType.ANIME },
    { label: 'GAME', value: SourceType.GAME },
    { label: 'MANGA', value: SourceType.MANGA },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          {/* Source Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onFilterChange(tab.value)}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all duration-300 active:scale-95 ${
                  currentFilter === tab.value
                    ? 'bg-white text-tech-pink shadow-sm ring-2 ring-tech-pink/20 scale-105 z-10'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* View Toggles (Visual only for prototype) */}
          <div className="flex items-center gap-2">
             <button className="p-2 rounded-lg bg-white text-slate-700 shadow-sm border border-slate-100 hover:text-holo-blue hover:scale-105 active:scale-95 transition-all">
                <Grid3X3 className="w-4 h-4" />
             </button>
             <button className="p-2 rounded-lg bg-transparent text-slate-400 hover:bg-white hover:text-slate-600 hover:scale-105 active:scale-95 transition-all">
                <List className="w-4 h-4" />
             </button>
             <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white shadow-lg shadow-slate-300/50 text-xs font-bold hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all ml-2 group">
                <Filter className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                <span>FILTER</span>
             </button>
          </div>
    </div>
  );
};

export default FilterBar;
