import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Character,
  METRIC_SOURCES,
  METRIC_SOURCE_LABELS,
  METRIC_SOURCE_UNITS,
  TimePeriod,
} from '../types';
import { useTranslation } from '../lib/i18n';
import { getSnapshotsForPeriod } from '../lib/history';
import { characterImage, handleImageError } from '../lib/images';
import SourceDots from './SourceDots';
import { TYPE_LABEL } from './RankRow';

interface DetailPanelProps {
  character: Character;
  onClose: () => void;
  timePeriod: TimePeriod;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ character, onClose, timePeriod }) => {
  const { t } = useTranslation();
  const history = getSnapshotsForPeriod(character, timePeriod);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop only exists below the breakpoint where the panel overlays. */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-ink-light/30 dark:bg-black/60 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={character.name}
        className="fixed lg:sticky top-0 right-0 z-50 lg:z-0 h-screen lg:h-[calc(100vh-4rem)] w-full max-w-md lg:max-w-none overflow-y-auto bg-surface-light dark:bg-surface-dark border-l border-line-light dark:border-line-dark animate-slide-in lg:animate-none"
      >
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <div className="min-w-0">
            <span className="tabular font-display text-rank-lg font-black leading-none">
              {character.rank}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="shrink-0 p-1.5 -m-1.5 rounded-md text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <img
            src={characterImage(character.image_url, character.name)}
            alt={character.name}
            onError={handleImageError}
            className="w-full aspect-[3/4] max-h-72 object-cover rounded-lg bg-line-light dark:bg-line-dark"
          />

          <h2 className="mt-4 font-display text-2xl font-black tracking-tight">{character.name}</h2>
          {character.name_jp && (
            <p className="font-jp text-muted-light dark:text-muted-dark">{character.name_jp}</p>
          )}
          <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
            {character.source}
            <span className="mx-1.5 opacity-40">·</span>
            {TYPE_LABEL[character.source_type]}
          </p>

          <div className="mt-5 flex items-end justify-between border-t border-line-light dark:border-line-dark pt-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
                {t('totalScore')}
              </p>
              <p className="tabular font-display text-4xl font-black leading-tight">
                {character.weighted_total.toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
                {t('measuredBy')}
              </p>
              <div className="mt-1.5 flex items-center justify-end gap-2">
                <SourceDots measured={character.measured_sources} />
                <span className="tabular text-sm font-bold">
                  {character.measured_sources.length}
                  <span className="font-normal text-muted-light dark:text-muted-dark">
                    /{METRIC_SOURCES.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The arithmetic behind the total, with the upstream figure beside each
            score so a reader can check it against the source themselves. */}
        <section className="px-5 mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
            {t('breakdown')}
          </h3>

          <dl className="mt-3 space-y-3">
            {METRIC_SOURCES.map((source) => {
              const score = character.scores[source];
              const count = character.counts?.[source] ?? null;

              return (
                <div key={source}>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm font-bold">{METRIC_SOURCE_LABELS[source]}</dt>
                    <dd className="tabular text-sm">
                      {score === null ? (
                        <span className="text-muted-light dark:text-muted-dark">
                          {t('notMeasured')}
                        </span>
                      ) : (
                        <>
                          <span className="text-muted-light dark:text-muted-dark">
                            {count?.toLocaleString()} {METRIC_SOURCE_UNITS[source]}
                          </span>
                          <span className="ml-3 font-black">{score.toFixed(1)}</span>
                        </>
                      )}
                    </dd>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-line-light dark:bg-line-dark overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${
                        score === null ? '' : 'bg-ink-light/80 dark:bg-ink-dark/80'
                      }`}
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-muted-light dark:text-muted-dark">
            {t('weightNote')}
            {character.measured_sources.length < METRIC_SOURCES.length && (
              <>
                {' '}
                {METRIC_SOURCES.filter((source) => character.scores[source] === null)
                  .map((source) => METRIC_SOURCE_LABELS[source])
                  .join(', ')}
                : {t('unmeasuredNote')}
              </>
            )}
          </p>
        </section>

        <section className="px-5 mt-8 pb-10">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark">
            {t('history')}
          </h3>

          {history.length === 0 ? (
            // Live rankings only gain history once snapshots accumulate, so an
            // empty axis frame would read as a bug.
            <div className="mt-3 rounded-lg border border-dashed border-line-light dark:border-line-dark px-4 py-8 text-center">
              <p className="text-sm font-bold">{t('noHistoryTitle')}</p>
              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                {t('noHistoryHint')}
              </p>
            </div>
          ) : (
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="currentColor" opacity={0.15} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid rgba(128,128,128,0.25)',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weighted_total"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </aside>
    </>
  );
};

export default DetailPanel;
