import React from 'react';
import { SourceType, TimePeriod } from '../types';
import { DownloadCloud, Code, SlidersHorizontal, BarChart } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface ControlsProps {
  currentFilter: SourceType;
  onFilterChange: (type: SourceType) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  minScore: number;
  maxScore: number;
  onScoreRangeChange: (min: number, max: number) => void;
  onExportCsv: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentFilter,
  onFilterChange,
  timePeriod,
  onTimePeriodChange,
  minScore,
  maxScore,
  onScoreRangeChange,
  onExportCsv,
}) => {
  const { t } = useTranslation();
  const tabs = [
    { label: 'ALL', value: SourceType.ALL },
    { label: 'ANIME', value: SourceType.ANIME },
    { label: 'GAME', value: SourceType.GAME },
    { label: 'MANGA', value: SourceType.MANGA },
  ];

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <BarChart className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-xl leading-none">CURRENT CHARTS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('globalAggregation')}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                currentFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[TimePeriod.WEEK, TimePeriod.MONTH, TimePeriod.YEAR].map((period) => (
            <button
              key={period}
              onClick={() => onTimePeriodChange(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                timePeriod === period
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Score</span>
          <input
            className="w-10 bg-white dark:bg-slate-700 border-none rounded p-0 text-center text-xs h-6"
            type="number"
            value={minScore}
            onChange={(e) => onScoreRangeChange(Number(e.target.value), maxScore)}
          />
          <span className="text-slate-400">-</span>
          <input
            className="w-10 bg-white dark:bg-slate-700 border-none rounded p-0 text-center text-xs h-6"
            type="number"
            value={maxScore}
            onChange={(e) => onScoreRangeChange(minScore, Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <DownloadCloud className="w-4 h-4" />
          CSV
        </button>
        <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
          <Code className="w-4 h-4" />
          Developer API
        </button>
      </div>
    </div>
  );
};

export default Controls;
