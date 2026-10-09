import React, { useId, useState } from 'react';
import { ChevronDown, Download, X } from 'lucide-react';
import { SourceType, TimePeriod } from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { getLatestSnapshot } from '../lib/history';
import { useMagStrings, type MagStringKey } from './strings';
import { CONTAINER } from './format';

const TYPES = [SourceType.ALL, SourceType.ANIME, SourceType.MANGA, SourceType.GAME] as const;
const PERIODS = [TimePeriod.WEEK, TimePeriod.MONTH, TimePeriod.YEAR] as const;

/** What the score column means for the selected period, from the data's own label. */
export const usePeriodLabel = () => {
  const board = useBoard();
  const s = useMagStrings();
  return (period: TimePeriod) => {
    if (period === TimePeriod.WEEK) return s('periodWEEKLong');
    const label = board.characters[0]
      ? getLatestSnapshot(board.characters[0], period)?.label ?? ''
      : '';
    return s(`period${period}Long` as MagStringKey, { label });
  };
};

const pressed = 'bg-mag-red text-mag-paper';
const idle = 'text-mag-ink hover:bg-mag-band';

/**
 * The index strip. Sticky, paper, closed by an ink rule. The type tabs work like
 * a magazine's thumb index: the open section is a solid vermilion tab.
 */
const Controls: React.FC = () => {
  const { t } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const periodLabel = usePeriodLabel();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const searchId = useId();

  const secondary = (
    <>
      <div className="flex items-center gap-2.5">
        <span className="mag-label text-mag-muted">{t('period')}</span>
        <div role="group" aria-label={t('period')} className="flex">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={board.timePeriod === period}
              aria-label={periodLabel(period)}
              title={periodLabel(period)}
              onClick={() => board.setTimePeriod(period)}
              className={`-ml-px grid h-8 min-w-[32px] place-items-center border border-mag-ink px-1.5 text-[13px] font-bold first:ml-0 ${
                board.timePeriod === period ? `${pressed} relative z-[1] border-mag-red` : idle
              }`}
            >
              {s(`period${period}` as MagStringKey)}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">{t('scoreRange')}</legend>
        <span aria-hidden className="mag-label text-mag-muted">
          {s('scoreShort')}
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={board.minScore}
          aria-label={s('scoreLow')}
          onChange={(event) => board.setScoreRange(Number(event.target.value) || 0, board.maxScore)}
          className="mag-number h-8 w-11 border-b border-mag-ink bg-transparent text-center text-[14px] font-bold tabular-nums"
        />
        <span aria-hidden className="text-mag-muted">
          –
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={board.maxScore}
          aria-label={s('scoreHigh')}
          onChange={(event) => {
            const value = event.target.value;
            // An emptied field means "no ceiling", not 0, which would hide
            // every entry the moment the field is cleared.
            board.setScoreRange(board.minScore, value === '' ? 100 : Number(value) || 100);
          }}
          className="mag-number h-8 w-11 border-b border-mag-ink bg-transparent text-center text-[14px] font-bold tabular-nums"
        />
      </fieldset>

      <div className="flex items-center gap-4 xl:ml-auto">
        <p aria-live="polite" className="text-[13px] font-medium tabular-nums text-mag-ink-2">
          {s('shown', { n: board.filtered.length })}
        </p>
        {board.hasFilters && (
          <button
            type="button"
            onClick={board.clearFilters}
            className="text-[13px] font-bold underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={board.exportCsv}
        className="ml-auto inline-flex h-9 items-center gap-2 border-2 border-mag-ink px-3 text-[12px] font-bold uppercase tracking-[0.08em] mag-x87 hover:bg-mag-band xl:ml-0"
      >
        <Download aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
        {t('exportCsv')}
      </button>
    </>
  );

  return (
    <div className="sticky top-0 z-30 border-b-2 border-mag-ink bg-mag-paper">
      <div className={`${CONTAINER} flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 sm:gap-x-6 xl:min-h-[60px] xl:flex-nowrap`}>
        <div className="order-1 flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <label htmlFor={searchId} className="mag-label shrink-0 text-mag-ink">
            {s('search')}
          </label>
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none xl:w-60">
            <input
              id={searchId}
              type="search"
              value={board.searchQuery}
              onChange={(event) => board.setSearchQuery(event.target.value)}
              placeholder={s('searchHint')}
              autoComplete="off"
              spellCheck={false}
              className={`mag-search h-9 w-full border-b-2 border-mag-ink bg-transparent text-[14px] font-medium placeholder:text-mag-muted sm:text-[15px] ${
                board.searchQuery ? 'pr-7' : ''
              }`}
            />
            {board.searchQuery && (
              <button
                type="button"
                onClick={() => board.setSearchQuery('')}
                aria-label={s('clearSearch')}
                className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center hover:bg-mag-band"
              >
                <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <div
          role="group"
          aria-label={s('type')}
          className="mag-scroll-x order-3 -mx-4 flex w-[calc(100%+2rem)] overflow-x-auto px-4 sm:order-2 sm:mx-0 sm:w-auto sm:px-0"
        >
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={board.filterType === type}
              onClick={() => board.setFilterType(type)}
              className={`mag-tab flex h-9 shrink-0 items-baseline gap-1.5 px-3 pt-[9px] leading-none ${
                board.filterType === type ? pressed : idle
              }`}
            >
              <span className="mag-x87 text-[13px] font-extrabold uppercase tracking-[0.06em]">
                {s(`type${type}` as MagStringKey)}
              </span>
              <span
                className={`text-[11px] font-semibold tabular-nums ${
                  board.filterType === type ? 'text-mag-paper' : 'text-mag-muted'
                }`}
              >
                {board.counts[type]}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={moreId}
          onClick={() => setMoreOpen((open) => !open)}
          className={`order-2 inline-flex h-9 shrink-0 items-center gap-1.5 border-2 px-3 text-[12px] font-bold uppercase tracking-[0.08em] mag-x87 sm:order-3 sm:ml-auto xl:hidden ${
            moreOpen ? `${pressed} border-mag-red` : 'border-mag-ink hover:bg-mag-band'
          }`}
        >
          {moreOpen ? s('less') : s('more')}
          {/* A chevron, not a triangle: on this page ▲ and ▼ mean movement. */}
          <ChevronDown
            aria-hidden
            strokeWidth={2.75}
            className={`h-3.5 w-3.5 ${moreOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          id={moreId}
          className={`${moreOpen ? 'flex' : 'hidden'} order-4 w-full flex-wrap items-center gap-x-6 gap-y-3 border-t border-mag-ink/30 pt-2.5 xl:order-4 xl:flex xl:w-auto xl:flex-1 xl:flex-nowrap xl:border-0 xl:pt-0`}
        >
          {secondary}
        </div>
      </div>
    </div>
  );
};

export default Controls;
