import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { METRIC_SOURCES, METRIC_SOURCE_LABELS, METRIC_SOURCE_UNITS, type MetricSourceId } from '../types';
import { useTranslation } from '../lib/i18n';

interface MethodologyModalProps {
  onClose: () => void;
  weights?: Record<MetricSourceId, number>;
}

const SOURCE_NOTES: Record<MetricSourceId, string> = {
  anilist: 'Character favourites on AniList. Anime and manga only.',
  mal: 'Character favourites on MyAnimeList, read through Jikan. Anime and manga only.',
  ao3: 'Works filed under the character’s canonical AO3 tag. Pairing tags are excluded.',
  danbooru: 'Posts carrying the character’s Danbooru tag.',
};

const MethodologyModal: React.FC<MethodologyModalProps> = ({ onClose, weights }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-ink-light/30 dark:bg-black/60 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-title"
        className="relative w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark animate-fade-in"
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 px-6 py-4 bg-surface-light dark:bg-surface-dark border-b border-line-light dark:border-line-dark">
          <h2 id="methodology-title" className="font-display text-lg font-black tracking-tight">
            {t('methodology')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 -m-1.5 rounded-md text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm leading-relaxed">
          <p>
            Every figure on this site is read from a public source at refresh time. There is no
            sample data and no estimated value: when a source cannot be read, it is marked as not
            measured and left out of the total rather than counted as zero.
          </p>

          <div>
            <h3 className="font-display font-black mb-3">Sources</h3>
            <dl className="space-y-3">
              {METRIC_SOURCES.map((source) => (
                <div
                  key={source}
                  className="flex flex-wrap items-baseline gap-x-3 border-b border-line-light dark:border-line-dark pb-3 last:border-0"
                >
                  <dt className="font-bold">{METRIC_SOURCE_LABELS[source]}</dt>
                  {weights && (
                    <span className="tabular text-xs font-bold text-muted-light dark:text-muted-dark">
                      weight {weights[source]}
                    </span>
                  )}
                  <span className="tabular text-xs text-muted-light dark:text-muted-dark">
                    counts {METRIC_SOURCE_UNITS[source]}
                  </span>
                  <dd className="w-full text-muted-light dark:text-muted-dark">
                    {SOURCE_NOTES[source]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="font-display font-black mb-2">Scoring</h3>
            <p className="text-muted-light dark:text-muted-dark">
              Each source is scored relative to the highest reading on the board for that source, on
              a log scale — 100 means “the most measured here”, not “the maximum possible”. The
              counts are heavy-tailed, so a linear scale would leave everyone below the top few
              indistinguishable. The total is the weighted mean over the sources that returned a
              reading, with the weights renormalised across them. A character measured by fewer than
              two sources is left off the board entirely.
            </p>
          </div>

          <div>
            <h3 className="font-display font-black mb-2">Who is on the board</h3>
            <p className="text-muted-light dark:text-muted-dark">
              Anime and manga characters are pulled automatically from AniList’s favourites ranking,
              filtered to male characters — no hand-picking. Game characters come from a short
              curated list in the repository, because AniList and MyAnimeList do not catalogue games
              and would otherwise erase every gacha character. That list decides who is covered; it
              never supplies their numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyModal;
