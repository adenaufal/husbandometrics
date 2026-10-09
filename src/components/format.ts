import type { SupportedLanguage } from '../lib/i18n';
import { METRIC_SOURCES, type Character, type MetricSourceId } from '../types';

/** Page furniture shared by every block: one measure, one gutter. */
export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10';

export const HTML_LANG: Record<SupportedLanguage, string> = {
  en: 'en',
  jp: 'ja',
  kr: 'ko',
  cn: 'zh-Hans',
};

/** Short names for tight places; the data box spells the full ones out. */
export const SOURCE_SHORT: Record<MetricSourceId, string> = {
  anilist: 'AniList',
  mal: 'MAL',
  ao3: 'AO3',
  danbooru: 'Danbooru',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (value: number) => String(value).padStart(2, '0');

/** "5 Oct" / "10月5日". Spelled by hand: en-GB now prints "Sept". */
export const shortDate = (date: Date, language: SupportedLanguage) => {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  if (language === 'jp' || language === 'cn') return `${month}月${day}日`;
  if (language === 'kr') return `${month}월 ${day}일`;
  return `${day} ${MONTHS[month - 1]}`;
};

/** "5 Oct 2026" / "2026年10月5日". */
export const longDate = (date: Date, language: SupportedLanguage) => {
  const year = date.getUTCFullYear();
  if (language === 'jp' || language === 'cn') return `${year}年${shortDate(date, language)}`;
  if (language === 'kr') return `${year}년 ${shortDate(date, language)}`;
  return `${shortDate(date, language)} ${year}`;
};

/** The dateline's English half is always set in English caps: "5 OCT 2026". */
export const datelineDate = (date: Date) =>
  `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()].toUpperCase()} ${date.getUTCFullYear()}`;

export const utcClock = (date: Date) => `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;

export const fromLabel = (label: string) => new Date(`${label}T00:00:00Z`);

/** Scores are stored to two decimals, and No. 1 and No. 2 differ in the second. */
export const score = (value: number) => value.toFixed(2);

/** Signed with a real minus sign, so the column of deltas lines up. */
export const signed = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : '±'}${Math.abs(value).toFixed(2)}`;

/** 0.4375 -> "43.75%", 0.35 -> "35%": exact, because the reader may check the sum. */
export const percent = (share: number) => `${Number((share * 100).toFixed(2))}%`;

/** Two- and three-digit ranks shrink so they keep the footprint of a single digit. */
export const numeralScale = (rank: number) => (rank >= 100 ? 0.64 : rank >= 10 ? 0.8 : 1);

export const jpName = (character: Character) => character.name_jp.trim();

/** Code points, not UTF-16 units, so a vertical name is sized by what is printed. */
export const glyphCount = (text: string) => Array.from(text).length;

/** Length of the longest word, which decides how large a name can be set. */
export const longestWord = (text: string) =>
  Math.max(1, ...text.split(/\s+/).map((word) => glyphCount(word)));

/** True when the entries are exactly the board ranks start, start + 1, ... */
export const isContiguous = (entries: Character[], start: number) =>
  entries.length > 0 && entries.every((character, index) => character.rank === start + index);

export const measuredCount = (character: Character) =>
  METRIC_SOURCES.filter((source) => character.scores[source] !== null).length;
