import React from 'react';
import { Loader2 } from 'lucide-react';
import { Character, Trend } from '../types';
import { useTranslation } from '../lib/i18n';
import RankRow from './RankRow';

interface RankingTableProps {
  characters: Character[];
  scoreFor: (character: Character) => number;
  selectedId: string | null;
  onSelect: (character: Character) => void;
  isLoading: boolean;
  onClearFilters: () => void;
}

const RankingTable: React.FC<RankingTableProps> = ({
  characters,
  scoreFor,
  selectedId,
  onSelect,
  isLoading,
  onClearFilters,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="border-t border-line-light dark:border-line-dark">
        <div className="flex items-center gap-2.5 px-4 py-5 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          <span className="font-bold">{t('measuring')}</span>
          <span className="text-muted-light dark:text-muted-dark">{t('measuringHint')}</span>
        </div>
        <ul>
          {Array.from({ length: 10 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center gap-5 px-4 py-3 border-b border-line-light dark:border-line-dark"
            >
              <span className="w-20 h-5 rounded bg-line-light dark:bg-line-dark animate-pulse" />
              <span className="w-12 h-12 rounded bg-line-light dark:bg-line-dark animate-pulse" />
              <span className="flex-1 h-4 rounded bg-line-light dark:bg-line-dark animate-pulse" />
              <span className="w-16 h-4 rounded bg-line-light dark:bg-line-dark animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!characters.length) {
    return (
      <div className="border-t border-line-light dark:border-line-dark py-24 text-center">
        <p className="font-display text-xl font-bold">{t('emptyTitle')}</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-sm font-bold text-accent dark:text-accent-dark hover:underline"
        >
          {t('clearFilters')}
        </button>
      </div>
    );
  }

  // The column is dropped rather than filled with a wall of em dashes: without
  // a database there is no previous snapshot, so every row is STABLE and the
  // column carries no information at all.
  const showTrend = characters.some((character) => character.trend !== Trend.STABLE);

  return (
    <div>
      {/* Column headers stay out of the tab order; each row is the control. */}
      <div
        className="hidden sm:flex items-center gap-5 px-4 py-2 border-y border-line-light dark:border-line-dark text-[11px] font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark"
        aria-hidden
      >
        <span className="w-20 text-right">{t('rank')}</span>
        <span className="w-12" />
        <span className="flex-1">{t('character')}</span>
        <span className="hidden md:block w-16">{t('sources')}</span>
        {showTrend && <span className="w-16 text-right">{t('trend')}</span>}
        <span className="w-20 text-right">{t('score')}</span>
      </div>

      <ul>
        {characters.map((character, index) => (
          <RankRow
            key={character.id}
            character={character}
            displayScore={scoreFor(character)}
            onSelect={onSelect}
            isSelected={selectedId === character.id}
            emphasis={index < 3}
            showTrend={showTrend}
          />
        ))}
      </ul>
    </div>
  );
};

export default RankingTable;
