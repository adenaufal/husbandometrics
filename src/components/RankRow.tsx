import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Character, SourceType, Trend } from '../types';
import { characterImage, handleImageError } from '../lib/images';
import { useTranslation } from '../lib/i18n';
import SourceDots from './SourceDots';

interface RankRowProps {
  character: Character;
  displayScore: number;
  onSelect: (character: Character) => void;
  isSelected: boolean;
  /** The top three get more height and a larger portrait. */
  emphasis: boolean;
  /** Hidden entirely while no character has a previous reading to move against. */
  showTrend: boolean;
}

export const TYPE_LABEL: Record<SourceType, string> = {
  [SourceType.ALL]: '',
  [SourceType.ANIME]: 'Anime',
  [SourceType.GAME]: 'Game',
  [SourceType.MANGA]: 'Manga',
};

const RankRow: React.FC<RankRowProps> = ({
  character,
  displayScore,
  onSelect,
  isSelected,
  emphasis,
  showTrend,
}) => {
  const { t } = useTranslation();
  const { rank, name, name_jp, source, source_type, image_url, trend, measured_sources } = character;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(character)}
        aria-current={isSelected ? 'true' : undefined}
        className={`group w-full text-left border-b border-line-light dark:border-line-dark transition-colors ${
          isSelected
            ? 'bg-accent-soft dark:bg-accent-dark/10'
            : 'hover:bg-surface-light dark:hover:bg-surface-dark'
        }`}
      >
        <div
          className={`flex items-center gap-2.5 sm:gap-5 px-3 sm:px-4 ${emphasis ? 'py-3.5 sm:py-5' : 'py-3'}`}
        >
          <span
            className={`tabular shrink-0 w-7 sm:w-20 text-right font-display font-black ${
              emphasis
                ? 'text-2xl sm:text-rank text-ink-light dark:text-ink-dark'
                : 'text-base sm:text-lg text-muted-light dark:text-muted-dark'
            }`}
          >
            {rank}
          </span>

          {/* object-top: portraits are waist-up crops, so anchoring to the top
              keeps the face in a square thumbnail instead of the chest. */}
          <img
            src={characterImage(image_url, name)}
            alt=""
            loading="lazy"
            onError={handleImageError}
            className={`shrink-0 rounded object-cover object-top bg-line-light dark:bg-line-dark ${
              emphasis ? 'w-12 h-12 sm:w-20 sm:h-20' : 'w-10 h-10 sm:w-12 sm:h-12'
            }`}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3
                className={`truncate-1 font-display font-bold tracking-tight ${
                  emphasis ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
                }`}
              >
                {name}
              </h3>
              {name_jp && (
                <span className="hidden lg:inline font-jp text-sm text-muted-light dark:text-muted-dark shrink-0">
                  {name_jp}
                </span>
              )}
            </div>
            <p className="truncate-1 text-xs sm:text-sm text-muted-light dark:text-muted-dark">
              {source}
              <span className="mx-1.5 opacity-40">·</span>
              {TYPE_LABEL[source_type]}
            </p>
          </div>

          <div className="hidden md:block shrink-0 w-16">
            <SourceDots measured={measured_sources} />
          </div>

          {showTrend && (
            <div className="hidden sm:flex shrink-0 w-16 items-center justify-end">
              {trend === Trend.RISING && (
                <ArrowUpRight className="w-4 h-4 text-rising" aria-label={t('trend')} />
              )}
              {trend === Trend.FALLING && (
                <ArrowDownRight className="w-4 h-4 text-falling" aria-label={t('trend')} />
              )}
              {trend === Trend.STABLE && (
                <span className="text-xs text-muted-light dark:text-muted-dark" aria-hidden>
                  —
                </span>
              )}
            </div>
          )}

          {/* No bar beside the figure. Scores cluster between about 60 and 96,
              so a bar drawn from zero fills to roughly the same width on every
              row and reads as agreement where there is none. The number in a
              tabular column is the honest comparison. */}
          <span
            className={`shrink-0 w-14 sm:w-20 text-right tabular font-display font-black ${
              emphasis ? 'text-xl sm:text-3xl' : 'text-base sm:text-xl'
            }`}
          >
            {displayScore.toFixed(1)}
          </span>
        </div>
      </button>
    </li>
  );
};

export default RankRow;
