import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TimePeriod, type Character } from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import Masthead from './Masthead';
import Controls, { usePeriodLabel } from './Controls';
import Spread from './Spread';
import Band from './Band';
import Listing from './Listing';
import DetailPanel from './DetailPanel';
import Methodology from './Methodology';
import Colophon from './Colophon';
import { EmptyBoard, ErrorNotice, LoadingBoard } from './States';
import { Legend } from './parts';
import { CONTAINER, HTML_LANG } from './format';
import { useFallbackGlyphs } from './useFallbackGlyphs';
import './magazine.css';

/**
 * The board, designed as the character-popularity results page of a Japanese
 * weekly ("Magazine"), rebuilt as a live board and printed in two colours on
 * newsprint. Measured, not voted - 人気ランキング, never 人気投票.
 *
 * Reading order follows a results spread: the top three as a feature, fourth
 * to tenth as a band of panels, then the dense listing. A search skips the
 * spread and lists matches; a type filter fills the spread from the filtered
 * board while every numeral keeps its real board rank.
 */
const Board: React.FC = () => {
  const { t, language } = useTranslation();
  const board = useBoard();
  const periodLabel = usePeriodLabel();
  const names = useMemo(() => board.characters.map((character) => character.name_jp), [board.characters]);
  useFallbackGlyphs(names);

  const [selected, setSelected] = useState<Character | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const openDetail = useCallback((character: Character, trigger: HTMLElement) => {
    opener.current = trigger;
    setSelected(character);
  }, []);
  const openMethodology = useCallback((trigger: HTMLElement) => {
    opener.current = trigger;
    setMethodologyOpen(true);
  }, []);
  const closeDetail = useCallback(() => setSelected(null), []);
  const closeMethodology = useCallback(() => setMethodologyOpen(false), []);

  const overlayOpen = selected !== null || methodologyOpen;

  // Focus goes back to the entry or link that opened the overlay. This runs
  // after the commit that lifts `inert`, so the target is focusable again.
  useEffect(() => {
    if (overlayOpen || !opener.current) return;
    if (opener.current.isConnected) opener.current.focus({ preventScroll: true });
    opener.current = null;
  }, [overlayOpen]);

  const query = board.searchQuery.trim();
  const searching = query !== '';
  const list = board.filtered;
  const spread = searching ? [] : list.slice(0, 3);
  const band = searching ? [] : list.slice(3, 10);
  const rest = searching ? list : list.slice(10);
  const scoreLabel =
    board.timePeriod === TimePeriod.WEEK ? t('score') : periodLabel(board.timePeriod);

  // The key goes on whichever section opens the page.
  const legendOnBand = spread.length === 0 && band.length > 0;
  const legendOnListing = spread.length === 0 && band.length === 0;

  // "No data yet" rather than isLoading: React Query pauses a retry while the
  // tab is in the background, and a paused query is neither loading nor
  // errored - it must not fall through to "nothing matches".
  let content: React.ReactNode;
  if (board.isError) content = <ErrorNotice />;
  else if (!board.metadata) content = <LoadingBoard />;
  else if (list.length === 0) content = <EmptyBoard />;
  else {
    content = (
      <>
        {spread.length > 0 && <Spread entries={spread} onOpen={openDetail} scoreLabel={scoreLabel} />}
        {band.length > 0 && (
          <Band entries={band} onOpen={openDetail} legend={legendOnBand ? <Legend /> : undefined} />
        )}
        {rest.length > 0 && (
          <Listing
            entries={rest}
            onOpen={openDetail}
            query={query}
            legend={legendOnListing ? <Legend /> : undefined}
          />
        )}
      </>
    );
  }

  return (
    <div lang={HTML_LANG[language]} className="mag-root min-h-screen bg-mag-paper font-mag-sans text-mag-ink">
      <div inert={overlayOpen}>
        <Masthead onOpenMethodology={openMethodology} />
        {board.characters.length > 0 && <Controls />}
        <main className={CONTAINER}>{content}</main>
        <Colophon onOpenMethodology={openMethodology} />
      </div>

      {selected && <DetailPanel character={selected} onClose={closeDetail} />}
      {methodologyOpen && <Methodology onClose={closeMethodology} />}
    </div>
  );
};

export default Board;
