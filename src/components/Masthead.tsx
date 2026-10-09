import React from 'react';
import { useTranslation, type SupportedLanguage } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { isoWeek } from '../lib/board';
import { METRIC_SOURCES } from '../types';
import { useMagStrings } from './strings';
import { CONTAINER, datelineDate } from './format';
import { Seal } from './parts';

const LANGUAGES: Array<{ id: SupportedLanguage; label: string; lang: string }> = [
  { id: 'en', label: 'EN', lang: 'en' },
  { id: 'jp', label: '日本語', lang: 'ja' },
  { id: 'kr', label: '한국어', lang: 'ko' },
  { id: 'cn', label: '中文', lang: 'zh-Hans' },
];

const Dot = () => (
  <span aria-hidden className="px-1.5 text-mag-muted">
    ·
  </span>
);

/**
 * The cover line of the issue: dateline, the wordmark run the full measure with
 * the seal stamped over its end, and the strapline that states the one claim
 * the site makes - measured, not voted.
 */
const Masthead: React.FC<{ onOpenMethodology: (trigger: HTMLElement) => void }> = ({
  onOpenMethodology,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();

  const updated = board.metadata ? new Date(board.metadata.updated_at) : null;
  const issue = updated ? isoWeek(updated) : null;

  return (
    <header className={`${CONTAINER} pt-3 sm:pt-4`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-2.5">
        <p className="mag-label flex flex-wrap items-baseline text-mag-ink">
          {updated && issue ? (
            <>
              <span lang="ja" className="font-mag-jp text-[12px] font-bold tracking-[0.06em]">
                {issue.year}年 第{issue.week}号
              </span>
              <Dot />
              <span className="tabular-nums">WEEK {issue.week}</span>
              <Dot />
              <time dateTime={board.metadata?.updated_at} className="tabular-nums">
                {datelineDate(updated)}
              </time>
            </>
          ) : (
            // No issue date until the board arrives; never claim a read is
            // under way when it has already failed.
            <>
              <span lang="ja" className="font-mag-jp text-[12px] font-bold tracking-[0.06em]">
                {board.isError ? 'お知らせ' : '計測中'}
              </span>
              <Dot />
              <span>{board.isError ? t('apiDownTitle') : s('readingLive')}</span>
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-y-1">
          <div role="group" aria-label={t('language')} className="flex items-center gap-0.5">
            {LANGUAGES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                lang={entry.lang}
                aria-pressed={language === entry.id}
                onClick={() => setLanguage(entry.id)}
                className={`min-h-[32px] shrink-0 whitespace-nowrap px-2 text-[12px] font-bold leading-none transition-colors ${
                  entry.id === 'en' ? 'mag-x87 tracking-[0.08em]' : 'font-mag-jp'
                } ${
                  language === entry.id
                    ? 'bg-mag-red text-mag-paper'
                    : 'text-mag-ink hover:bg-mag-band'
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
          {/* The divider would dangle at a line end where the row wraps. */}
          <span aria-hidden className="mx-2.5 hidden h-4 w-px bg-mag-ink/50 sm:block" />
          <button
            type="button"
            onClick={(event) => onOpenMethodology(event.currentTarget)}
            className="mag-label ml-2 min-h-[32px] whitespace-nowrap px-1 text-mag-ink underline decoration-1 underline-offset-[5px] hover:decoration-2 sm:ml-0"
          >
            {t('methodology')}
          </button>
        </div>
      </div>

      <div className="h-1 bg-mag-ink" />

      <div className="mag-mast relative pt-3 sm:pt-4 lg:pt-5">
        <h1 className="mag-wordmark overflow-x-clip whitespace-nowrap font-mag-sans mag-x62 font-black uppercase leading-[0.8] text-mag-ink">
          Husbandometrics
        </h1>
        <Seal className="absolute right-0 top-[52%] w-[13cqi] max-w-[88px] -translate-y-1/2 rotate-[-3deg]" />
      </div>

      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-4">
        <span lang="ja" className="font-mag-jp text-[19px] font-black leading-tight sm:text-[23px]">
          人気ランキング
        </span>
        <span aria-hidden className="text-[17px] sm:text-[20px]">
          —
        </span>
        <span className="mag-x87 text-[17px] font-semibold italic leading-tight sm:text-[20px]">
          {s('strap')}
        </span>
        {/* On phones this group wraps to its own line, where a leading dot
            would dangle, so the first separator only shows beside the claim. */}
        <span className="flex items-baseline text-[13px] font-medium tabular-nums text-mag-ink-2 sm:text-[15px]">
          {board.characters.length > 0 && (
            <>
              <span aria-hidden className="hidden pr-1.5 text-mag-muted md:inline">
                ·
              </span>
              {s('characters', { n: board.characters.length })}
              <Dot />
            </>
          )}
          {s('sourceCount', { n: board.metadata?.sources.length ?? METRIC_SOURCES.length })}
        </span>
      </p>

      <div className="mag-double-rule mt-3 sm:mt-4" />
    </header>
  );
};

export default Masthead;
