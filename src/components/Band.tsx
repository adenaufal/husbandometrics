import React, { useId } from 'react';
import type { Character } from '../types';
import { useBoard } from '../lib/board-context';
import { useMagStrings, type MagStringKey } from './strings';
import { isContiguous, jpName, score } from './format';
import {
  EntryButton,
  Panel,
  RankNumeral,
  SectionHead,
  SourceMarks,
  TrendMark,
  type OpenEntry,
} from './parts';
import { rangeLabel } from './Spread';

const BandEntry: React.FC<{ character: Character; onOpen: OpenEntry }> = ({ character, onOpen }) => {
  const board = useBoard();
  const s = useMagStrings();
  const jp = jpName(character);

  return (
    <article className="mag-band-entry group">
      <div className="relative [grid-area:panel]">
        <Panel character={character} frame={2} className="aspect-[2/3] w-full" />
        <RankNumeral rank={character.rank} suffix={0.34} className="mag-band-rank" />
      </div>

      {jp && (
        <p
          lang="ja"
          className="mag-vertical max-h-full font-mag-jp text-[14px] font-bold text-mag-ink [grid-area:jp] md:text-[15px]"
        >
          {jp}
        </p>
      )}

      <div className="flex min-w-0 flex-col pt-3 [grid-area:body]">
        <h3 className="mag-name line-clamp-2 font-mag-sans mag-x75 text-[18px] font-extrabold leading-[0.95] md:text-[20px]">
          <EntryButton
            character={character}
            onOpen={onOpen}
            className="decoration-2 underline-offset-4 group-hover:underline"
          />
        </h3>
        <p className="mb-2.5 mt-1.5 truncate text-[12px] font-medium text-mag-ink-2">
          {character.source}
          <span aria-hidden className="px-1 text-mag-muted">
            ·
          </span>
          {s(`type${character.source_type}` as MagStringKey)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-mag-ink pt-2">
          <span className="font-mag-sans mag-x62 text-[30px] font-black leading-[0.8] tabular-nums">
            {score(board.scoreFor(character))}
          </span>
          <span className="flex items-center gap-1.5">
            <TrendMark character={character} />
            <SourceMarks measured={character.measured_sources} size="sm" />
          </span>
        </div>
      </div>
    </article>
  );
};

/**
 * How to read an entry. It fills the cell the band leaves empty when seven
 * entries wrap onto a grid of two or four; on the seven-column spread there is
 * no gap to fill and the legend above does the job alone.
 */
const ReadingKey: React.FC<{ fullBand: boolean; sampleRank: number }> = ({
  fullBand,
  sampleRank,
}) => {
  const s = useMagStrings();
  const board = useBoard();
  // The samples are pictures of the marks, not readings, so they are hidden
  // from assistive tech and the definitions carry the meaning.
  return (
    <aside
      aria-label={s('keyTitle')}
      className={`self-start border-2 border-mag-ink p-3 text-[12px] leading-snug text-mag-ink-2 ${
        fullBand ? 'mag-band-key-full' : ''
      }`}
    >
      <p className="flex items-baseline gap-2 border-b border-mag-ink pb-2 text-mag-ink">
        <span lang="ja" className="font-mag-jp text-[13px] font-black">
          読み方
        </span>
        <span className="mag-label">{s('keyTitle')}</span>
      </p>
      <dl className="mt-3 space-y-3">
        <div className="flex items-start gap-3">
          <dt aria-hidden className="w-10 shrink-0 font-mag-sans mag-x62 text-[28px] font-black leading-[0.8] text-mag-ink">
            {sampleRank}
            <span lang="ja" className="font-mag-jp text-[10px]">
              位
            </span>
          </dt>
          <dd>{s('keyRank')}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt aria-hidden className="flex w-10 shrink-0 gap-[3px] pt-1">
            {[true, true, false, true].map((filled, index) => (
              <span key={index} className={`block h-[7px] w-[7px] border border-mag-ink ${filled ? 'bg-mag-ink' : ''}`} />
            ))}
          </dt>
          <dd>{s('keyMarks')}</dd>
        </div>
        <div className="flex items-start gap-3">
          <dt aria-hidden className="flex w-10 shrink-0 items-center gap-1.5 pt-1 text-mag-ink">
            <svg viewBox="0 0 8 7" width="8" height="7">
              <path d="M4 0 8 7H0Z" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 8 7" width="8" height="7">
              <path d="M0 0h8L4 7Z" fill="currentColor" />
            </svg>
          </dt>
          <dd>{s('keyTrend')}</dd>
        </div>
        {board.movement.anyRemeasured && (
          <div className="flex items-start gap-3">
            <dt aria-hidden lang="ja" className="w-10 shrink-0 font-mag-jp text-[12px] font-bold leading-none text-mag-ink">
              再
            </dt>
            <dd>{s('keyRemeasured')}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
};

const Band: React.FC<{ entries: Character[]; onOpen: OpenEntry; legend?: React.ReactNode }> = ({
  entries,
  onOpen,
  legend,
}) => {
  const s = useMagStrings();
  const headId = useId();
  const contiguous = isContiguous(entries, 4);
  const first = entries[0]?.rank ?? 4;

  return (
    <section aria-labelledby={headId} className="pt-16 sm:pt-24">
      <SectionHead
        id={headId}
        jp={contiguous ? rangeLabel(first, first + entries.length - 1) : `続く${entries.length}名`}
        label={contiguous ? s('band') : s('bandView')}
        aside={legend}
      />
      <div className="mag-band mt-10 sm:mt-12">
        {entries.map((character) => (
          <BandEntry key={character.id} character={character} onOpen={onOpen} />
        ))}
        <ReadingKey fullBand={entries.length === 7} sampleRank={first} />
      </div>
    </section>
  );
};

export default Band;
