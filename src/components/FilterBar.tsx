import React from 'react';
import { SourceType, TimePeriod } from '../types';
import { Filter, Grid3X3, List, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  currentFilter: SourceType;
  onFilterChange: (type: SourceType) => void;
  franchises: string[];
  selectedFranchise: string;
  onFranchiseChange: (value: string) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  minScore: number;
  maxScore: number;
  onScoreRangeChange: (min: number, max: number) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  franchises,
  selectedFranchise,
  onFranchiseChange,
  timePeriod,
  onTimePeriodChange,
  minScore,
  maxScore,
  onScoreRangeChange,
}) => {
  const tabs = [
    { label: 'ALL', value: SourceType.ALL },
    { label: 'ANIME', value: SourceType.ANIME },
    { label: 'GAME', value: SourceType.GAME },
    { label: 'MANGA', value: SourceType.MANGA },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 p-3 rounded-2xl border border-white backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Period</span>
              <div className="flex gap-2 bg-slate-100/60 p-1 rounded-lg">
                {[TimePeriod.WEEK, TimePeriod.MONTH, TimePeriod.YEAR].map((period) => (
                  <button
                    key={period}
                    onClick={() => onTimePeriodChange(period)}
                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${
                      timePeriod === period ? 'bg-white text-tech-pink shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                <span>Score</span>
                <input
                  type="number"
                  value={minScore}
                  min={0}
                  max={maxScore}
                  onChange={(e) => onScoreRangeChange(Number(e.target.value) || 0, maxScore)}
                  className="w-14 px-2 py-1 rounded-md border border-slate-200 text-xs font-bold text-slate-600 focus:border-tech-pink/40 focus:outline-none"
                />
                <span>-</span>
                <input
                  type="number"
                  value={maxScore}
                  min={minScore}
                  max={100}
                  onChange={(e) => onScoreRangeChange(minScore, Number(e.target.value) || 100)}
                  className="w-14 px-2 py-1 rounded-md border border-slate-200 text-xs font-bold text-slate-600 focus:border-tech-pink/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Franchise</span>
              <select
                value={selectedFranchise}
                onChange={(e) => onFranchiseChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:border-tech-pink/40 focus:outline-none"
              >
                <option value="ALL">All Sources</option>
                {franchises.map((franchise) => (
                  <option key={franchise} value={franchise}>{franchise}</option>
                ))}
              </select>
            </div>
          </div>

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
