import React from 'react';
import { METRIC_SOURCES, METRIC_SOURCE_LABELS } from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { useMagStrings } from './strings';
import { CONTAINER, longDate, percent, utcClock } from './format';

/** The small print: what was read, how it was weighted, when. */
const Colophon: React.FC<{ onOpenMethodology: (trigger: HTMLElement) => void }> = ({
  onOpenMethodology,
}) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const weights = board.metadata?.weights;
  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;

  return (
    <footer className={`${CONTAINER} pb-12 pt-20 sm:pt-28`}>
      <div className="mag-double-rule" />
      <div className="mt-4 grid gap-x-10 gap-y-3 text-[12px] leading-relaxed text-mag-ink-2 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-baseline">
        <p className="flex items-baseline gap-2.5 text-mag-ink">
          <span lang="ja" className="font-mag-jp text-[13px] font-black">
            奥付
          </span>
          <span className="mag-label">{s('colophon')}</span>
        </p>

        <p>
          <span className="font-bold text-mag-ink">{s('sourcesLabel')}</span>{' '}
          {/* Each source holds together; the spaces between them are where a
              narrow screen may break the line. */}
          {METRIC_SOURCES.map((source, index) => (
            <React.Fragment key={source}>
              <span className="whitespace-nowrap">
                {METRIC_SOURCE_LABELS[source]}
                {weights && <span className="tabular-nums"> {percent(weights[source])}</span>}
              </span>
              {index < METRIC_SOURCES.length - 1 && (
                <>
                  {' '}
                  <span aria-hidden className="text-mag-muted">
                    ·
                  </span>{' '}
                </>
              )}
            </React.Fragment>
          ))}
          {updated && (
            <>
              {' '}
              <span aria-hidden className="px-1.5 text-mag-muted">
                /
              </span>{' '}
              <span className="whitespace-nowrap">
                <span className="font-bold text-mag-ink">{t('updated')}</span>{' '}
                <time dateTime={board.metadata?.updated_at} className="tabular-nums">
                  {longDate(updated, language)}, {utcClock(updated)}
                </time>
              </span>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={(event) => onOpenMethodology(event.currentTarget)}
          className="mag-label justify-self-start text-mag-ink underline decoration-1 underline-offset-[5px] hover:decoration-2"
        >
          {t('methodology')}
        </button>
      </div>
    </footer>
  );
};

export default Colophon;
