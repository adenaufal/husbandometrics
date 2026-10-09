import React, { useId } from 'react';
import { X } from 'lucide-react';
import { METRIC_SOURCES, METRIC_SOURCE_LABELS, METRIC_SOURCE_UNITS } from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { METHODOLOGY, SOURCE_NOTES } from '../lib/methodology';
import { useMagStrings } from './strings';
import { longDate, percent, utcClock } from './format';
import { useDialog } from './useDialog';

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-2 mt-7 border-t-2 border-mag-ink pt-2 font-mag-sans mag-x75 text-[19px] font-extrabold uppercase leading-tight tracking-[0.01em] [break-after:avoid] first:mt-0">
    {children}
  </h3>
);

/**
 * The method, set as the magazine's editorial column: a lede with a drop
 * initial, then two columns of text. The sentences are the shared ones from
 * lib/methodology - the product's promise is typeset here, never rewritten.
 */
const Methodology: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const ref = useDialog<HTMLDivElement>(onClose);
  const titleId = useId();
  const weights = board.metadata?.weights;
  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      <div aria-hidden className="mag-fade-in fixed inset-0 bg-mag-ink/40" />
      <div
        className="relative flex min-h-full items-start justify-center sm:px-6 sm:py-10 lg:py-14"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="mag-fade-in relative w-full max-w-[980px] bg-mag-paper text-mag-ink outline-none sm:border-2 sm:border-mag-ink"
        >
          <div className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b-4 border-mag-ink bg-mag-paper px-5 sm:px-8">
            <p className="flex items-baseline gap-3">
              <span lang="ja" className="font-mag-jp text-[15px] font-black">
                算出方法
              </span>
              <span className="mag-label">{t('methodology')}</span>
            </p>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label={t('close')}
              className="grid h-10 w-10 place-items-center border-2 border-mag-ink hover:bg-mag-band"
            >
              <X aria-hidden className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-5 pb-12 pt-8 sm:px-8 lg:px-12">
            <h2
              id={titleId}
              className="font-mag-sans mag-x62 text-[64px] font-black uppercase leading-[0.82] tracking-[-0.01em] sm:text-[96px]"
            >
              {t('methodology')}
            </h2>
            <p className="mag-label mt-3 text-mag-muted">
              {s('strap')}
              {updated && (
                <>
                  <span aria-hidden className="px-1.5">
                    ·
                  </span>
                  {t('updated')} {longDate(updated, language)}, {utcClock(updated)}
                </>
              )}
            </p>

            <p className="mag-dropcap mt-8 border-t-4 border-mag-ink pt-5 text-[18px] font-medium leading-[1.55] sm:text-[20px]">
              {METHODOLOGY.intro}
            </p>

            <div className="mag-columns mt-8 text-[15px] leading-[1.6]">
              <Heading>{s('scoring')}</Heading>
              <p>{METHODOLOGY.scoring}</p>

              <Heading>{s('sourcesLabel')}</Heading>
              <dl>
                {METRIC_SOURCES.map((source) => (
                  <div key={source} className="break-inside-avoid border-b border-mag-ink/30 py-2.5 first:pt-0">
                    <dt className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-bold">{METRIC_SOURCE_LABELS[source]}</span>
                      <span className="mag-label text-mag-muted">
                        {weights && `${s('weightOf', { w: percent(weights[source]) })} · `}
                        {s('countsUnit', { unit: METRIC_SOURCE_UNITS[source] })}
                      </span>
                    </dt>
                    <dd className="mt-1 text-[14px] text-mag-ink-2">{SOURCE_NOTES[source]}</dd>
                  </div>
                ))}
              </dl>

              <Heading>{s('roster')}</Heading>
              <p>{METHODOLOGY.roster}</p>

              <Heading>{s('movement')}</Heading>
              <p>{METHODOLOGY.movement}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
