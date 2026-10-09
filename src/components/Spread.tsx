import React, { useId } from 'react';
import {
  METRIC_SOURCES,
  METRIC_SOURCE_LABELS,
  METRIC_SOURCE_UNITS,
  type Character,
} from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { formatCount } from '../lib/board';
import { useMagStrings, type MagStringKey } from './strings';
import { glyphCount, isContiguous, jpName, longestWord, score, shortDate } from './format';
import {
  EntryButton,
  Legend,
  MovementNote,
  Panel,
  RankNumeral,
  SectionHead,
  SourceMarks,
  TrendMark,
  type OpenEntry,
} from './parts';

export const rangeLabel = (start: number, end: number) =>
  start === end ? `${start}位` : `${start}位〜${end}位`;

/**
 * The four readings behind No. 1, printed small beside the portrait the way a
 * results page prints the vote count. Unmeasured sources are spelled out.
 */
const DataBox: React.FC<{ character: Character; className?: string }> = ({
  character,
  className = '',
}) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;

  return (
    <div className={`self-start border-2 border-mag-ink bg-mag-paper ${className}`}>
      <div className="flex items-baseline justify-between gap-3 bg-mag-ink px-2.5 pb-1 pt-1.5 text-mag-paper">
        <span lang="ja" className="font-mag-jp text-[12px] font-bold leading-none">
          計測データ
        </span>
        {updated && (
          <span className="mag-label text-[10px] leading-none">
            {s('latestReading', { date: shortDate(updated, language) })}
          </span>
        )}
      </div>
      <table className="w-full text-[12px] leading-tight">
        <caption className="sr-only">{t('breakdown')}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{s('source')}</th>
            <th scope="col">{t('rawFigure')}</th>
            <th scope="col">{t('score')}</th>
          </tr>
        </thead>
        <tbody>
          {METRIC_SOURCES.map((source) => {
            const value = character.scores[source];
            const count = character.counts?.[source] ?? null;
            return (
              <tr key={source} className="border-t border-mag-ink/25 first:border-t-0">
                <th scope="row" className="py-[7px] pl-2.5 pr-2 text-left font-bold">
                  {METRIC_SOURCE_LABELS[source]}
                </th>
                {value === null ? (
                  <td colSpan={2} className="py-[7px] pr-2.5 text-right text-mag-muted">
                    {t('notMeasured')}
                  </td>
                ) : (
                  <>
                    {/* The unit may drop below the figure in a narrow box; the
                        figure itself never breaks. */}
                    <td className="py-[7px] pr-2 text-right tabular-nums">
                      <span className="whitespace-nowrap">{count === null ? '—' : formatCount(count)}</span>{' '}
                      <span className="text-mag-muted">{METRIC_SOURCE_UNITS[source]}</span>
                    </td>
                    <td className="py-[7px] pr-2.5 text-right font-bold tabular-nums">{score(value)}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface EntryProps {
  character: Character;
  onOpen: OpenEntry;
  scoreLabel: string;
}

const typeKey = (character: Character) => `type${character.source_type}` as MagStringKey;

/**
 * The feature: portrait and a tone panel side by side with a slanted gutter,
 * the rank figure breaking out across both, the name, the score and the data.
 */
const Feature: React.FC<EntryProps> = ({ character, onOpen, scoreLabel }) => {
  const board = useBoard();
  const s = useMagStrings();
  const jp = jpName(character);

  return (
    <article className="mag-feature group">
      <Panel character={character} cut="r" eager className="mag-feature-panel" />

      <div className="mag-feature-tone mag-panel mag-cut-l">
        <div className="mag-panel-fill mag-tone" />
        {jp && (
          <p
            lang="ja"
            className="mag-feature-caption mag-vertical border-2 border-mag-ink bg-mag-paper px-[0.2em] py-[0.32em] font-mag-jp font-black text-mag-ink"
            style={{ ['--len' as string]: glyphCount(jp) }}
          >
            {jp}
          </p>
        )}
      </div>

      <RankNumeral
        rank={character.rank}
        red={character.rank === 1}
        suffix={0.3}
        className="mag-feature-rank"
      />

      <div className="mag-feature-head mag-fit flex min-w-0 flex-col">
        <h3
          className="mag-name mag-fit-name font-mag-sans mag-x75 font-extrabold leading-[0.9] tracking-[-0.01em] [--fit-max:40px] sm:[--fit-max:50px] xl:[--fit-max:60px]"
          style={{ ['--fit-len' as string]: longestWord(character.name) }}
        >
          <EntryButton
            character={character}
            onOpen={onOpen}
            className="decoration-[3px] underline-offset-[7px] group-hover:underline"
          />
        </h3>
        <p className="mag-label mt-3 text-mag-ink-2">
          {character.source}
          <span aria-hidden className="px-1.5 text-mag-muted">
            ·
          </span>
          {s(typeKey(character))}
        </p>
        <MovementNote character={character} className="mt-1.5" />

        <div className="mt-6 flex items-end gap-5 sm:mt-auto sm:pt-8">
          <div>
            <p className="mag-label text-mag-muted">{scoreLabel}</p>
            <p className="mag-fit-score font-mag-sans mag-x62 font-black leading-[0.8] tracking-[-0.01em] tabular-nums [--score-max:84px] sm:[--score-max:104px]">
              {score(board.scoreFor(character))}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2.5 pb-1">
            <TrendMark trend={character.trend} size={14} />
            <SourceMarks measured={character.measured_sources} size="lg" />
            <span className="mag-label text-mag-muted">
              {character.measured_sources.length}/{METRIC_SOURCES.length}
            </span>
          </div>
        </div>
      </div>

      <DataBox character={character} className="mag-feature-data" />
    </article>
  );
};

/** No. 2 and No. 3: a horizontal entry with the vertical name at its edge. */
const Runner: React.FC<EntryProps & { variant: 'a' | 'b' }> = ({
  character,
  onOpen,
  scoreLabel,
  variant,
}) => {
  const board = useBoard();
  const s = useMagStrings();
  const jp = jpName(character);

  return (
    <article className={`mag-runner mag-runner-${variant} group`}>
      <div className="mag-runner-panelwrap">
        <Panel character={character} eager className="mag-runner-panel" />
        {/* On phones the figure sits on the foot of the panel. */}
        <RankNumeral
          rank={character.rank}
          className="mag-runner-rank absolute -bottom-[0.18em] -left-[0.05em] z-[3] md:hidden"
        />
      </div>

      {jp && (
        <p
          lang="ja"
          className="mag-runner-jp mag-vertical font-mag-jp text-[16px] font-black text-mag-ink md:max-h-[280px] md:text-[22px] xl:max-h-[300px] xl:text-[26px]"
        >
          {jp}
        </p>
      )}

      <div className="mag-runner-body mag-fit flex flex-col pt-8 md:pt-0">
        <RankNumeral
          rank={character.rank}
          className="mag-runner-rank relative z-[3] -ml-[0.3em] -mt-[0.04em] hidden md:flex"
        />
        <h3
          className="mag-name mag-fit-name font-mag-sans mag-x75 font-extrabold leading-[0.92] [--fit-max:22px] md:mt-4 md:[--fit-max:30px] xl:[--fit-max:36px]"
          style={{ ['--fit-len' as string]: longestWord(character.name) }}
        >
          <EntryButton
            character={character}
            onOpen={onOpen}
            className="decoration-2 underline-offset-[5px] group-hover:underline"
          />
        </h3>
        <p className="mag-label mt-2 text-mag-ink-2">
          {character.source}
          <span aria-hidden className="px-1.5 text-mag-muted">
            ·
          </span>
          {s(typeKey(character))}
        </p>
        <MovementNote character={character} className="mt-1" />

        <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2 md:mt-auto md:pt-4">
          <div>
            <p className="mag-label text-mag-muted">{scoreLabel}</p>
            <p className="font-mag-sans mag-x62 text-[44px] font-black leading-[0.8] tabular-nums md:text-[52px] xl:text-[60px]">
              {score(board.scoreFor(character))}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <TrendMark trend={character.trend} size={10} />
            <SourceMarks measured={character.measured_sources} />
          </div>
        </div>
      </div>
    </article>
  );
};

const Spread: React.FC<{
  entries: Character[];
  onOpen: OpenEntry;
  scoreLabel: string;
}> = ({ entries, onOpen, scoreLabel }) => {
  const s = useMagStrings();
  const headId = useId();
  const contiguous = isContiguous(entries, 1);

  return (
    <section aria-labelledby={headId} className="pt-10 sm:pt-14">
      <SectionHead
        id={headId}
        jp={contiguous ? rangeLabel(1, entries.length) : `上位${entries.length}名`}
        label={contiguous ? s('top') : s('topView')}
        aside={<Legend />}
      />
      {!contiguous && <p className="mag-label mt-2.5 text-mag-muted">{s('boardRanks')}</p>}

      <div className="mag-spread mt-14 sm:mt-16">
        <Feature character={entries[0]} onOpen={onOpen} scoreLabel={scoreLabel} />
        {entries.length > 1 && (
          <>
            <div aria-hidden className="mag-fold" />
            <div className="mag-runners">
              {entries.slice(1).map((character, index) => (
                <Runner
                  key={character.id}
                  character={character}
                  onOpen={onOpen}
                  scoreLabel={scoreLabel}
                  variant={index === 0 ? 'a' : 'b'}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Spread;
