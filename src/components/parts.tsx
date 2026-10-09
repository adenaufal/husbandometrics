import React, { useId } from 'react';
import {
  METRIC_SOURCES,
  METRIC_SOURCE_LABELS,
  Trend,
  type Character,
  type MetricSourceId,
} from '../types';
import { characterImage, handleImageError } from '../lib/images';
import { useBoard } from '../lib/board-context';
import { useMagStrings } from './strings';
import { numeralScale } from './format';

export type OpenEntry = (character: Character, trigger: HTMLElement) => void;

// ---------------------------------------------------------------------------
// Provenance

const MARK_SIZE = {
  sm: 'h-[7px] w-[7px]',
  md: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
} as const;

/**
 * Which of the four sources measured this character, in fixed order. A total
 * averaged over two readings must never look as solid as one over four, so this
 * sits on every entry: filled ink for a reading, a hollow square for none.
 */
export const SourceMarks: React.FC<{
  measured: MetricSourceId[];
  size?: keyof typeof MARK_SIZE;
  className?: string;
}> = ({ measured, size = 'md', className = '' }) => {
  const s = useMagStrings();
  const label = measured.length
    ? s('measuredByOf', {
        list: measured.map((source) => METRIC_SOURCE_LABELS[source]).join(', '),
        n: measured.length,
      })
    : s('measuredByNone');

  return (
    <span role="img" aria-label={label} title={label} className={`inline-flex shrink-0 gap-[3px] ${className}`}>
      {METRIC_SOURCES.map((source) => (
        <span
          key={source}
          className={`block border border-mag-ink ${MARK_SIZE[size]} ${
            measured.includes(source) ? 'bg-mag-ink' : ''
          }`}
        />
      ))}
    </span>
  );
};

/** Ink only: the shape carries the meaning, colour is reserved. */
export const TrendMark: React.FC<{ trend: Trend; size?: number; className?: string }> = ({
  trend,
  size = 8,
  className = '',
}) => {
  const s = useMagStrings();

  if (trend === Trend.STABLE) {
    const label = s('steady');
    return (
      <span role="img" aria-label={label} title={label} className={`inline-flex items-center ${className}`} style={{ width: size }}>
        <span className="block h-px w-full bg-mag-muted" />
      </span>
    );
  }

  const label = trend === Trend.RISING ? s('rising') : s('falling');
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 8 7"
      width={size}
      height={(size * 7) / 8}
      className={`shrink-0 text-mag-ink ${className}`}
    >
      <title>{label}</title>
      <path d={trend === Trend.RISING ? 'M4 0 8 7H0Z' : 'M0 0h8L4 7Z'} fill="currentColor" />
    </svg>
  );
};

/** The key that explains the marks, set where the marks first appear. */
export const Legend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const s = useMagStrings();
  return (
    <p className={`mag-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mag-muted ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="block h-2 w-2 border border-mag-ink bg-mag-ink" />
        {s('legendMeasured')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden className="block h-2 w-2 border border-mag-ink" />
        {s('legendNot')}
      </span>
      <span className="text-mag-ink-2">AniList · MAL · AO3 · Danbooru</span>
    </p>
  );
};

// ---------------------------------------------------------------------------
// Panels and numerals

/**
 * A framed manga panel holding the portrait. `cut` slants one edge; the frame
 * follows the slant because it is the panel's own ink showing round the art.
 */
export const Panel: React.FC<{
  character: Character;
  className?: string;
  cut?: 'none' | 'r' | 'l' | 't' | 'b';
  frame?: 1 | 2 | 3;
  eager?: boolean;
  alt?: string;
}> = ({ character, className = '', cut = 'none', frame = 3, eager = false, alt = '' }) => (
  <div className={`mag-panel mag-frame-${frame} ${cut === 'none' ? '' : `mag-cut-${cut}`} ${className}`}>
    <div className="mag-panel-fill">
      <img
        src={characterImage(character.image_url, character.name)}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={(event) => handleImageError(event, character.name)}
        className="mag-print h-full w-full object-cover object-top"
      />
    </div>
  </div>
);

/**
 * The rank figure with its 位. Decorative to assistive tech: the entry's button
 * already announces the rank, so this would only read it twice.
 */
export const RankNumeral: React.FC<{
  rank: number;
  className?: string;
  /** Size of 位 relative to the figure. */
  suffix?: number;
  keyline?: boolean;
  red?: boolean;
}> = ({ rank, className = '', suffix = 0.3, keyline = true, red = false }) => (
  <span
    aria-hidden
    className={`flex items-baseline whitespace-nowrap leading-[0.8] ${red ? 'text-mag-red' : 'text-mag-ink'} ${className}`}
  >
    <span
      className={`font-mag-sans mag-x62 font-black tabular-nums tracking-[-0.02em] ${keyline ? 'mag-keyline' : ''}`}
      style={{ fontSize: `${numeralScale(rank)}em` }}
    >
      {rank}
    </span>
    <span
      lang="ja"
      className={`font-mag-jp font-black ${keyline ? 'mag-keyline' : ''}`}
      style={{ fontSize: `${suffix}em`, ['--mag-key' as string]: '0.14em' }}
    >
      位
    </span>
  </span>
);

/**
 * The entry's name doubles as its button; .mag-stretch spreads the hit area
 * over the whole entry. The visually hidden prefix gives the rank to screen
 * readers, which the decorative numeral does not.
 */
export const EntryButton: React.FC<{
  character: Character;
  onOpen: OpenEntry;
  className?: string;
}> = ({ character, onOpen, className = '' }) => {
  const s = useMagStrings();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => onOpen(character, event.currentTarget)}
      className={`mag-stretch text-left uppercase ${className}`}
    >
      <span className="sr-only">{s('rankPrefix', { n: character.rank })} </span>
      {character.name}
    </button>
  );
};

/**
 * Last week's rank, rebuilt from history by lib/board. A character missing from
 * last week's board is "back" or "new", never "unranked".
 */
export const MovementNote: React.FC<{ character: Character; className?: string }> = ({
  character,
  className = '',
}) => {
  const board = useBoard();
  const s = useMagStrings();
  const movement = board.movement.byId.get(character.id);
  if (!movement || !board.movement.previousLabel) return null;

  const text =
    movement.status === 'ranked' && movement.previousRank !== null
      ? s('lastWeek', { n: movement.previousRank })
      : movement.status === 'returning'
        ? s('returning')
        : s('newEntry');

  return <p className={`mag-label text-mag-muted ${className}`}>{text}</p>;
};

// ---------------------------------------------------------------------------
// Section furniture

/**
 * A section opens with its Japanese label knocked out of an ink block, the
 * English line beside it, and a 2px rule running the measure.
 */
export const SectionHead: React.FC<{
  id: string;
  jp: string;
  label: string;
  aside?: React.ReactNode;
}> = ({ id, jp, label, aside }) => (
  <div className="flex flex-wrap items-end gap-x-6 gap-y-2 border-b-2 border-mag-ink">
    <h2 id={id} className="flex min-w-0 items-end gap-3 sm:gap-4">
      <span
        lang="ja"
        className="shrink-0 bg-mag-ink px-2.5 pb-[5px] pt-[7px] font-mag-jp text-[19px] font-black leading-none text-mag-paper sm:px-3 sm:text-[22px]"
      >
        {jp}
      </span>
      <span className="mag-label pb-[7px] text-mag-ink">{label}</span>
    </h2>
    {aside && <div className="ml-auto pb-[7px]">{aside}</div>}
  </div>
);

// ---------------------------------------------------------------------------
// The seal

/**
 * The brand mark: a vermilion square seal, 計 ("measure") cut out of it, stamped
 * over the end of the wordmark. The character and inner border are knocked out
 * rather than painted, and the seal multiplies, so the black letter under it
 * shows through the red the way it does on a real stamped page.
 */
export const Seal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const raw = useId();
  const maskId = `mag-seal-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg viewBox="0 0 100 100" aria-hidden focusable="false" className={`mag-seal text-mag-red ${className}`}>
      <defs>
        <mask id={maskId}>
          <rect width="100" height="100" fill="white" />
          <rect x="8.5" y="8.5" width="83" height="83" fill="none" stroke="black" strokeWidth="3.4" />
          <text
            x="50"
            y="52"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Zen Kaku Gothic New', sans-serif"
            fontWeight={900}
            fontSize="64"
            fill="black"
          >
            計
          </text>
        </mask>
      </defs>
      <rect width="100" height="100" rx="4" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
};
