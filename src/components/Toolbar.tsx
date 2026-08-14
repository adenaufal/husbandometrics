import React from 'react';
import { Download } from 'lucide-react';
import { SourceType, TimePeriod } from '../types';
import { useTranslation } from '../lib/i18n';

interface ToolbarProps {
  filterType: SourceType;
  onFilterChange: (type: SourceType) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  minScore: number;
  maxScore: number;
  onScoreRangeChange: (min: number, max: number) => void;
  onExportCsv: () => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  resultCount: number;
}

const segment =
  'px-3 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap';
const segmentActive = 'bg-ink-light text-paper-light dark:bg-ink-dark dark:text-paper-dark';
const segmentIdle =
  'text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark';

const Toolbar: React.FC<ToolbarProps> = ({
  filterType,
  onFilterChange,
  timePeriod,
  onTimePeriodChange,
  minScore,
  maxScore,
  onScoreRangeChange,
  onExportCsv,
  hasFilters,
  onClearFilters,
  resultCount,
}) => {
  const { t } = useTranslation();

  const types: Array<{ value: SourceType; label: string }> = [
    { value: SourceType.ALL, label: t('allTypes') },
    { value: SourceType.ANIME, label: 'Anime' },
    { value: SourceType.MANGA, label: 'Manga' },
    { value: SourceType.GAME, label: 'Game' },
  ];

  const periods: Array<{ value: TimePeriod; label: string }> = [
    { value: TimePeriod.WEEK, label: 'W' },
    { value: TimePeriod.MONTH, label: 'M' },
    { value: TimePeriod.YEAR, label: 'Y' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
      <div className="flex items-center gap-1" role="group" aria-label={t('character')}>
        {types.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onFilterChange(type.value)}
            aria-pressed={filterType === type.value}
            className={`${segment} ${filterType === type.value ? segmentActive : segmentIdle}`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
          {t('period')}
        </span>
        <div className="flex items-center gap-1" role="group" aria-label={t('period')}>
          {periods.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => onTimePeriodChange(period.value)}
              aria-pressed={timePeriod === period.value}
              className={`${segment} w-9 text-center ${
                timePeriod === period.value ? segmentActive : segmentIdle
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
        {t('scoreRange')}
        <input
          type="number"
          min={0}
          max={100}
          value={minScore}
          onChange={(event) =>
            onScoreRangeChange(Number(event.target.value) || 0, maxScore)
          }
          className="tabular w-16 px-2 py-1 rounded-md border border-line-light dark:border-line-dark bg-transparent text-sm font-bold text-ink-light dark:text-ink-dark normal-case tracking-normal"
          aria-label={`${t('scoreRange')} min`}
        />
        <span aria-hidden>–</span>
        <input
          type="number"
          min={0}
          max={100}
          value={maxScore}
          onChange={(event) =>
            onScoreRangeChange(minScore, Number(event.target.value) || 0)
          }
          className="tabular w-16 px-2 py-1 rounded-md border border-line-light dark:border-line-dark bg-transparent text-sm font-bold text-ink-light dark:text-ink-dark normal-case tracking-normal"
          aria-label={`${t('scoreRange')} max`}
        />
      </label>

      <div className="ml-auto flex items-center gap-3">
        <span className="tabular text-sm text-muted-light dark:text-muted-dark">{resultCount}</span>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-bold text-accent dark:text-accent-dark hover:underline"
          >
            {t('clearFilters')}
          </button>
        )}
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line-light dark:border-line-dark text-sm font-bold hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
        >
          <Download className="w-3.5 h-3.5" aria-hidden />
          {t('exportCsv')}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
