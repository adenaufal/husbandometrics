import React, { useId } from 'react';
import type { Character } from '../types';
import { useBoard } from '../lib/board-context';
import { useMagStrings } from './strings';
import { isContiguous, jpName, numeralScale, score } from './format';
import {
  EntryButton,
  Panel,
  SectionHead,
  SourceMarks,
  TrendMark,
  type OpenEntry,
} from './parts';
import { rangeLabel } from './Spread';

/**
 * One line of the lower-rank table: figure, thumbnail, name, score and marks,
 * about 64px tall, hairline-ruled like the small print of a results page.
 */
const ListingEntry: React.FC<{ character: Character; onOpen: OpenEntry }> = ({ character, onOpen }) => {
  const board = useBoard();
  const jp = jpName(character);

  return (
    <li className="break-inside-avoid">
      <div className="group relative grid grid-cols-[3.25rem_2.5rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-mag-ink/30 py-[5px] pr-1 transition-colors hover:bg-mag-band">
        <span
          aria-hidden
          className="text-right font-mag-sans mag-x62 font-black leading-[0.8] tabular-nums tracking-[-0.02em]"
          style={{ fontSize: `${40 * numeralScale(character.rank)}px` }}
        >
          {character.rank}
        </span>
        <Panel character={character} frame={1} className="h-[60px] w-10" />
        <div className="min-w-0">
          <h3 className="truncate font-mag-sans mag-x87 text-[14px] font-extrabold leading-tight tracking-[0.01em]">
            <EntryButton
              character={character}
              onOpen={onOpen}
              className="decoration-1 underline-offset-[3px] group-hover:underline"
            />
          </h3>
          {jp && (
            <p lang="ja" className="truncate font-mag-jp text-[12px] font-medium leading-snug text-mag-ink-2">
              {jp}
            </p>
          )}
          <p className="truncate text-[12px] leading-snug text-mag-muted">{character.source}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-mag-sans mag-x62 text-[22px] font-extrabold leading-[0.8] tabular-nums">
            {score(board.scoreFor(character))}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendMark trend={character.trend} size={7} />
            <SourceMarks measured={character.measured_sources} size="sm" />
          </span>
        </div>
      </div>
    </li>
  );
};

const Listing: React.FC<{
  entries: Character[];
  onOpen: OpenEntry;
  query: string;
  legend?: React.ReactNode;
}> = ({ entries, onOpen, query, legend }) => {
  const s = useMagStrings();
  const headId = useId();
  const searching = query.trim() !== '';
  const first = entries[0]?.rank ?? 11;
  const last = entries[entries.length - 1]?.rank ?? first;
  const contiguous = !searching && isContiguous(entries, 11);

  const jp = searching ? '検索結果' : contiguous ? rangeLabel(first, last) : `以下${entries.length}名`;
  const label = searching
    ? s('matches', { n: entries.length, q: query.trim() })
    : contiguous
      ? s('rest')
      : s('restView');

  return (
    <section aria-labelledby={headId} className={searching ? 'pt-10 sm:pt-14' : 'pt-16 sm:pt-24'}>
      <SectionHead id={headId} jp={jp} label={label} aside={legend} />
      {searching && <p className="mag-label mt-2.5 text-mag-muted">{s('boardRanks')}</p>}
      <ol className="mag-listing mt-5 sm:mt-6">
        {entries.map((character) => (
          <ListingEntry key={character.id} character={character} onOpen={onOpen} />
        ))}
      </ol>
    </section>
  );
};

export default Listing;
