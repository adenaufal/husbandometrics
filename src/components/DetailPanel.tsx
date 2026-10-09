import React, { Suspense, lazy, useId } from 'react';
import { X } from 'lucide-react';
import {
  METRIC_SOURCES,
  METRIC_SOURCE_LABELS,
  METRIC_SOURCE_UNITS,
  type Character,
} from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { arithmeticFor, formatCount, isoWeek, readingSeries } from '../lib/board';
import { METHODOLOGY } from '../lib/methodology';
import { useMagStrings, type MagStringKey } from './strings';
import {
  SOURCE_SHORT,
  glyphCount,
  jpName,
  percent,
  score,
  shortDate,
  signed,
} from './format';
import { MovementNote, Panel, RankNumeral, SourceMarks } from './parts';
import { useDialog } from './useDialog';

// recharts is the largest dependency on the page and draws only this chart, so
// it loads when a profile first opens instead of before the board can render.
const HistoryChart = lazy(() => import('./HistoryChart'));

/**
 * The arithmetic behind the total: the upstream figure, its score against the
 * board's peak, the weight it carries after renormalising, and what it adds.
 * The sum is printed only when the terms rebuild the published total.
 */
const Arithmetic: React.FC<{ character: Character }> = ({ character }) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const headId = useId();
  const weights = board.metadata?.weights;
  if (!weights) return null;

  const sum = arithmeticFor(character, weights, board.peaks);
  const measured = sum.terms.filter((term) => term.score !== null).length;
  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;
  const peaks = METRIC_SOURCES.flatMap((source) => {
    const peak = board.peaks[source];
    // A peak held off the board is back-solved from stored scores, so it is
    // marked approximate rather than printed as if it were read.
    return peak ? [`${SOURCE_SHORT[source]} ${peak.holder ? '' : '≈'}${formatCount(peak.count)}`] : [];
  });

  const cell = 'py-2.5 align-top tabular-nums';

  return (
    <section aria-labelledby={headId} className="mt-8">
      <div className="flex items-baseline justify-between gap-3 bg-mag-ink px-3 pb-1.5 pt-2 text-mag-paper">
        <h3 id={headId} className="flex items-baseline gap-2.5">
          <span lang="ja" className="font-mag-jp text-[14px] font-black leading-none">
            計測データ
          </span>
          <span className="mag-label leading-none">{t('breakdown')}</span>
        </h3>
        {updated && (
          <span className="mag-label text-[10px] leading-none">
            {s('latestReading', { date: shortDate(updated, language) })}
          </span>
        )}
      </div>

      <table className="w-full border-x-2 border-b-2 border-mag-ink text-[12px] leading-tight">
        <thead>
          <tr className="border-b border-mag-ink text-mag-muted">
            <th scope="col" className="mag-label py-2 pl-3 pr-2 text-left text-[10px]">
              {s('source')}
            </th>
            <th scope="col" className="mag-label py-2 pr-2 text-right text-[10px]">
              {t('rawFigure')}
            </th>
            <th scope="col" className="mag-label py-2 pr-2 text-right text-[10px]">
              {t('score')}
            </th>
            <th scope="col" className="mag-label py-2 pr-2 text-right text-[10px]">
              {s('share')}
            </th>
            <th scope="col" className="mag-label py-2 pr-3 text-right text-[10px]">
              {s('adds')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sum.terms.map((term) => (
            <tr key={term.source} className="border-b border-mag-ink/25 last:border-b-0">
              <th scope="row" className="py-2.5 pl-3 pr-2 text-left align-top font-bold">
                {METRIC_SOURCE_LABELS[term.source]}
              </th>
              {term.score === null || term.share === null || term.contribution === null ? (
                <td colSpan={4} className="py-2.5 pr-3 text-right align-top text-mag-muted">
                  {s('notMeasuredRow')}
                </td>
              ) : (
                <>
                  <td className={`${cell} pr-2 text-right`}>
                    <span className="block font-semibold">
                      {term.count === null ? '—' : formatCount(term.count)}
                    </span>
                    <span className="block text-[11px] text-mag-muted">
                      {METRIC_SOURCE_UNITS[term.source]}
                    </span>
                  </td>
                  <td className={`${cell} pr-2 text-right font-bold`}>{score(term.score)}</td>
                  <td className={`${cell} pr-2 text-right`}>{percent(term.share)}</td>
                  <td className={`${cell} pr-3 text-right font-bold`}>{score(term.contribution)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        {sum.consistent && (
          <tfoot>
            <tr className="border-t-2 border-mag-ink">
              <td colSpan={4} className="py-2.5 pl-3 pr-2 align-middle text-[12px] text-mag-ink-2">
                {s('sumLine', { n: measured })}
              </td>
              <td className="whitespace-nowrap py-2 pr-3 text-right align-middle font-mag-sans mag-x62 text-[26px] font-black leading-none tabular-nums">
                = {score(sum.total)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      <p className="mt-2.5 text-[11px] leading-snug text-mag-muted">
        {s('scoreRule')} {peaks.length > 0 && `${s('peaks')}: ${peaks.join(' · ')}.`}
      </p>
    </section>
  );
};

/**
 * The character's own page: a side panel on wide screens, a full-screen sheet
 * on phones, with a sticky bar that keeps the close button in reach.
 */
const DetailPanel: React.FC<{ character: Character; onClose: () => void }> = ({
  character,
  onClose,
}) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const ref = useDialog<HTMLDivElement>(onClose);
  const titleId = useId();

  const jp = jpName(character);
  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;
  const issue = updated ? isoWeek(updated) : null;
  const movement = board.movement.byId.get(character.id);
  const series = readingSeries(character);
  const previous = series[series.length - 2];

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden className="mag-fade-in absolute inset-0 bg-mag-ink/40" onClick={onClose} />

      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="mag-slide-in absolute inset-y-0 right-0 w-full overflow-y-auto overscroll-contain bg-mag-paper text-mag-ink outline-none sm:w-[460px] sm:border-l-4 sm:border-mag-ink"
      >
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-mag-ink bg-mag-paper px-5 sm:px-7">
          <p className="mag-label flex items-baseline gap-3">
            <span>{s('rankPrefix', { n: character.rank })}</span>
            {issue && (
              <span lang="ja" className="font-mag-jp text-[12px] font-bold tracking-[0.04em] text-mag-muted">
                {issue.year}年 第{issue.week}号
              </span>
            )}
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

        <div className="px-5 pb-12 pt-6 sm:px-7">
          <div className="grid grid-cols-[minmax(0,13.5rem)_minmax(0,1fr)] gap-x-4">
            <Panel
              character={character}
              cut="b"
              eager
              alt={character.name}
              className="aspect-[2/3] w-full"
            />
            <div className="flex min-w-0 flex-col items-start">
              <RankNumeral
                rank={character.rank}
                red={character.rank === 1}
                keyline={false}
                suffix={0.3}
                className="-ml-[0.04em] text-[112px] sm:text-[140px]"
              />
              {jp && (
                <p
                  lang="ja"
                  className="mag-vertical mt-auto max-h-[60%] self-end font-mag-jp font-black text-mag-ink"
                  style={{ fontSize: `max(15px, min(40px, calc(180px / ${glyphCount(jp)})))` }}
                >
                  {jp}
                </p>
              )}
            </div>
          </div>

          <h2
            id={titleId}
            className="mag-name mt-5 font-mag-sans mag-x75 text-[34px] font-extrabold uppercase leading-[0.9] tracking-[-0.005em] sm:text-[40px]"
          >
            {character.name}
          </h2>
          <p className="mag-label mt-2.5 text-mag-ink-2">
            {character.source}
            <span aria-hidden className="px-1.5 text-mag-muted">
              ·
            </span>
            {s(`type${character.source_type}` as MagStringKey)}
          </p>

          <div className="mt-6 flex items-end justify-between gap-4 border-t-2 border-mag-ink pt-3">
            <div>
              <p className="mag-label text-mag-muted">{t('totalScore')}</p>
              <p className="font-mag-sans mag-x62 text-[68px] font-black leading-[0.8] tabular-nums">
                {score(character.weighted_total)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 pb-0.5">
              <p className="mag-label text-mag-muted">{t('measuredBy')}</p>
              <SourceMarks measured={character.measured_sources} size="lg" />
              <p className="text-[12px] font-semibold tabular-nums">
                {character.measured_sources.length}/{METRIC_SOURCES.length}
              </p>
            </div>
          </div>

          {movement && (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-mag-ink/30 pt-2.5">
              <MovementNote character={character} className="text-mag-ink" />
              {movement.delta !== null && previous && (
                <p className="text-[12px] tabular-nums text-mag-ink-2">
                  {s('changeSince', {
                    delta: signed(movement.delta),
                    date: shortDate(previous.date, language),
                  })}
                </p>
              )}
            </div>
          )}

          <Arithmetic character={character} />
          {/* Holds the chart's height so the panel does not jump when it lands. */}
          <Suspense fallback={<div aria-hidden className="mt-10 h-[290px]" />}>
            <HistoryChart character={character} />
          </Suspense>

          <p className="mt-6 border-t border-mag-ink/30 pt-3 text-[12px] leading-relaxed text-mag-ink-2">
            {METHODOLOGY.movement}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
