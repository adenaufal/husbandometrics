import React from 'react';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { useMagStrings } from './strings';
import { SectionHead } from './parts';

const Block: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden className={`bg-mag-band ${className}`} />
);

/**
 * Proofs before the plates: the page's own layout in unprinted blocks while the
 * live sources are read. No pulse - print does not shimmer.
 */
export const LoadingBoard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className="pt-10 sm:pt-14">
      <SectionHead id="mag-loading" jp="計測中" label={t('measuring')} />
      <p className="mt-2.5 text-[13px] text-mag-muted">{t('measuringHint')}</p>

      <div className="mag-spread mt-14 sm:mt-16">
        <div className="grid grid-cols-[minmax(0,236px)_minmax(0,1fr)] gap-4 sm:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <Block className="aspect-[2/3]" />
          <div className="flex flex-col gap-3">
            <Block className="h-1/2 min-h-[120px]" />
            <Block className="h-10 w-3/4" />
            <Block className="h-4 w-1/2" />
            <Block className="mt-auto h-20 w-1/2" />
          </div>
        </div>
        <div aria-hidden className="mag-fold" />
        <div className="mag-runners">
          {[0, 1].map((index) => (
            <div key={index} className="grid gap-4 md:grid-cols-[168px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)]">
              <Block className="aspect-[2/3]" />
              <div className="flex flex-col gap-3">
                <Block className="h-24 w-24" />
                <Block className="h-8 w-3/4" />
                <Block className="mt-auto h-12 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mag-band mt-20 sm:mt-28">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2.5">
            <Block className="aspect-[2/3]" />
            <Block className="h-4 w-4/5" />
            <Block className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

/** An ink-framed notice, the one place a vermilion rule marks something gone wrong. */
export const ErrorNotice: React.FC = () => {
  const { t } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  return (
    <div className="pt-12 sm:pt-16">
      <div role="alert" className="max-w-2xl border-2 border-t-[6px] border-mag-ink border-t-mag-red p-6 sm:p-8">
        <p className="flex items-baseline gap-3">
          <span lang="ja" className="font-mag-jp text-[15px] font-black">
            お知らせ
          </span>
          <span className="mag-label text-mag-muted">{s('notice')}</span>
        </p>
        <h2 className="mt-4 font-mag-sans mag-x75 text-[36px] font-extrabold uppercase leading-[0.92] sm:text-[48px]">
          {t('apiDownTitle')}
        </h2>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-mag-ink-2">{t('apiDownBody')}</p>
        <button
          type="button"
          onClick={board.refetch}
          disabled={board.isFetching}
          className="mt-6 inline-flex h-11 items-center border-2 border-mag-ink px-5 text-[13px] font-bold uppercase tracking-[0.08em] mag-x87 hover:bg-mag-band disabled:cursor-wait disabled:text-mag-muted"
        >
          {board.isFetching ? t('retrying') : t('retry')}
        </button>
      </div>
    </div>
  );
};

export const EmptyBoard: React.FC = () => {
  const { t } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const query = board.searchQuery.trim();
  return (
    <div role="status" className="pb-6 pt-16 sm:pt-24">
      <p className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <span lang="ja" className="font-mag-jp text-[64px] font-black leading-none sm:text-[112px]">
          該当なし
        </span>
        <span className="font-mag-sans mag-x75 text-[26px] font-extrabold uppercase leading-[0.95] sm:text-[40px]">
          {t('emptyTitle')}
        </span>
      </p>
      {query && (
        <p className="mt-5 text-[15px] text-mag-ink-2">
          <span className="mag-label text-mag-muted">{s('search')}</span>{' '}
          <q className="font-bold text-mag-ink">{query}</q>
        </p>
      )}
      <button
        type="button"
        onClick={board.clearFilters}
        className="mt-8 inline-flex h-11 items-center border-2 border-mag-ink px-5 text-[13px] font-bold uppercase tracking-[0.08em] mag-x87 hover:bg-mag-band"
      >
        {t('clearFilters')}
      </button>
    </div>
  );
};
