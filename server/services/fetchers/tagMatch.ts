import { CharacterQuery, NOISE, franchiseTokens, tokenize, words } from './types';

/**
 * How surely an upstream tag names a character.
 *
 * AO3 and Danbooru both file a character as a name and, sometimes, a qualifier
 * naming the franchise: `levi_(shingeki_no_kyojin)`, "Tartaglia | Childe
 * (Genshin Impact)". The matcher before this one asked only whether a tag
 * contained one of the character's names, then ranked the hits by post count.
 * Dozens of remembered tags named someone else as a result - Lelouch was
 * counted under `rem_(re:zero)`, because AniList lists "Zero" among his names -
 * and since tags are remembered, every weekly refresh counted them again.
 */
export type TagFit = {
  /**
   * 3: the character's name, in any word order - "Gojo Satoru".
   * 2: part of it under the franchise's qualifier - "L (Death Note)" - or the
   *    name and one word more - "Levi Ackerman" for AniList's plain "Levi".
   * 1: an alias, or a mix of the character's names - `thorfinn_thorsson`.
   */
  rank: 1 | 2 | 3;
  /**
   * What the tag's qualifier says. `franchise`: it names the franchise -
   * `levi_(shingeki_no_kyojin)`. `part`: one part of it, the way AO3 splits
   * long-running series - "Joseph Joestar (JoJo: Battle Tendency)". `none`:
   * there is no qualifier.
   */
  qualifier: 'franchise' | 'part' | 'none';
};

type Rank = TagFit['rank'];

/** Qualifier words that say what kind of franchise it is, not which one. */
const MEDIUM = new Set([
  'anime', 'manga', 'series', 'comic', 'comics', 'webtoon', 'manhwa', 'novel', 'novels',
  'game', 'games', 'video',
]);

const QUALIFIER = /\(([^()]*)\)\s*$/;

/**
 * `name_(qualifier)`, or AO3's `Name | Other Name (Qualifier)`. Costumes and
 * forms stack a second qualifier - `zhongli_(archon)_(genshin_impact)` - so
 * every trailing one is collected.
 */
const parseTag = (tag: string) => {
  let rest = tag.replace(/_/g, ' ').trim();
  const qualifiers: string[] = [];
  for (let match = QUALIFIER.exec(rest); match; match = QUALIFIER.exec(rest)) {
    qualifiers.unshift(match[1]);
    rest = rest.slice(0, match.index).trim();
  }

  return {
    names: rest
      .split('|')
      // AO3 sets a nickname in quotes inside the name: Kageyama "Mob" Shigeo.
      .map((name) => name.replace(/"[^"]*"/g, ' ').trim())
      .filter(Boolean),
    qualifier: qualifiers.length ? qualifiers.join(' ') : null,
  };
};

const core = (tokens: string[]) => tokens.filter((token) => token.length > 1);

const same = (a: string[], b: string[]) => {
  const left = new Set(a);
  const right = new Set(b);
  return left.size > 0 && left.size === right.size && [...left].every((token) => right.has(token));
};

const within = (part: string[], whole: string[]) =>
  part.length > 0 && part.every((token) => whole.includes(token));

/** "Tengen Toppa Gurren Lagann" -> "ttgl", which is how Danbooru qualifies Kamina. */
const acronyms = (titles: string[]) =>
  titles
    .map((title) => words(title).map((word) => word[0]).join(''))
    .filter((acronym) => acronym.length >= 3);

const franchiseWords = (hints: string[]) => new Set([...franchiseTokens(hints), ...acronyms(hints)]);

const qualifierWords = (text: string) =>
  tokenize(text).filter((token) => !NOISE.has(token) && !MEDIUM.has(token));

/**
 * Every word of the qualifier has to belong to the franchise. Sharing one is
 * not enough: "One-Punch Man" shares "one" with One Piece. Failing that, the
 * part before a colon will do, which is how AO3 names one part of a long
 * series: "JoJo: Battle Tendency" is a title AniList never lists.
 */
const readQualifier = (qualifier: string, hints: string[]): TagFit['qualifier'] | null => {
  const franchise = franchiseWords(hints);
  const belongs = (text: string) => {
    const tokens = qualifierWords(text);
    return tokens.length > 0 && tokens.every((token) => franchise.has(token));
  };

  if (belongs(qualifier)) return 'franchise';
  return qualifier.includes(':') && belongs(qualifier.split(':')[0]) ? 'part' : null;
};

/**
 * Words for comparing names, with doubled letters collapsed too: AniList
 * writes "Gon Freecss" and AO3 "Gon Freecs".
 */
const nameWords = (value: string) => words(value).map((word) => word.replace(/(.)\1+/g, '$1'));

/** The name part of each alias: "Levi Heichou (リヴァイ兵長)" is "Levi Heichou". */
export const aliasNames = (aliases: string[]) =>
  aliases
    .flatMap((alias) => parseTag(alias).names)
    .filter((name) => core(nameWords(name)).length > 0);

/**
 * The character's own name as AniList spells it, then with long vowels
 * shortened - AO3 files Jotaro as "Kujo Jotaro", which "Joutarou Kuujou" never
 * reaches in its autocomplete - then without hyphens: "Koro-sensei" is AO3's
 * "Korosensei", and its autocomplete reads the hyphenated form as two words.
 */
export const spellings = (name: string) => [
  ...new Set([
    name,
    name.replace(/ou/gi, 'o').replace(/oo/gi, 'o').replace(/uu/gi, 'u'),
    name.replace(/-/g, ''),
  ]),
];

/** One letter added, dropped or changed. */
const oneEditApart = (a: string, b: string) => {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
};

/**
 * Every word but one the same, and that one a long word a letter off:
 * AniList's "Chrollo Lucilfer", the official spelling, is AO3's "Chrollo
 * Lucifer".
 */
const nearlySame = (tag: string[], own: string[]) => {
  const missing = own.filter((word) => !tag.includes(word));
  const extra = tag.filter((word) => !own.includes(word));
  return (
    own.length > 1 &&
    tag.length === own.length &&
    missing.length === 1 &&
    extra.length === 1 &&
    missing[0].length >= 6 &&
    oneEditApart(missing[0], extra[0])
  );
};

type Names = { primary: string[]; aliases: string[][]; every: string[] };

const namesOf = (query: CharacterQuery): Names => {
  const primary = nameWords(query.name);
  const aliases = aliasNames(query.aliases).map(nameWords);
  return { primary, aliases, every: core([...primary, ...aliases.flat()]) };
};

const rankName = (name: string[], names: Names, corroborated: boolean): Rank | null => {
  const tag = core(name);
  const own = core(names.primary);

  if (same(tag, own)) return 3;
  // The same words run together: "Korosensei".
  if (name.length > 0 && name.join('') === names.primary.join('')) return 3;
  // Part of the name only counts with the franchise behind it: "L (Death
  // Note)" is him, "Kim Myungsoo | L" is a singer.
  if (corroborated && within(name, names.primary) && !same(name, names.primary)) return 2;
  // The whole name, initials included, and one word more, never further:
  // "Potato Chip Eaten By Yagami Light" contains Light's whole name too, and
  // "Jin Geum Seong" all of "Jin-U Seong" but the U.
  if (within(names.primary, name) && new Set(tag).size === new Set(own).size + 1) return 2;
  if (nearlySame(tag, own)) return 2;
  // A one-word alias needs the franchise behind it. `zolo` alone is someone
  // else's 16 posts; `twilight_(spy_x_family)` is Loid Forger.
  if (names.aliases.some((alias) => same(tag, core(alias)) && (corroborated || core(alias).length > 1))) {
    return 1;
  }
  // `thorfinn_thorsson`: the name AniList uses, and the patronymic it lists as an alias.
  if (tag.length > 1 && within(tag, names.every) && tag.some((token) => own.includes(token))) return 1;
  return null;
};

/**
 * How surely `tag` names the character in `query`, or null when it names
 * someone else.
 *
 * - The name has to be one of the character's names, whole. Containing one is
 *   not enough: `rem_(re:zero)` contains "Zero".
 * - A qualifier has to name the franchise, or the tag belongs to someone else:
 *   `miyamoto_musashi_(fate)` is not Vagabond's Musashi, and
 *   `zhongli_(archon)_(genshin_impact)` is a costume.
 */
export const fitTag = (query: CharacterQuery, tag: string): TagFit | null => {
  const { names, qualifier } = parseTag(tag);
  // "Edward Elric's Son", "Gon Freecs' Great-Grandmother": filed under his
  // name, but someone else.
  if (names.some((name) => /['’]s\b|s['’](\s|$)/i.test(name))) return null;

  const kind = qualifier === null ? 'none' : readQualifier(qualifier, query.franchiseHints);
  if (kind === null) return null;

  const own = namesOf(query);
  const ranks = names
    .map((name) => rankName(nameWords(name), own, kind !== 'none'))
    .filter((rank): rank is Rank => rank !== null);

  return ranks.length ? { rank: Math.max(...ranks) as Rank, qualifier: kind } : null;
};

/**
 * Whether a bare tag's name is also filed under other franchises.
 *
 * AO3 leaves a shared name bare for its best-known bearer and qualifies
 * everyone else's. So when the character's own franchise is not among the
 * qualified ones either, the bare tag is somebody else's: "Miyamoto Musashi |
 * Saber" is Fate's, beside the same name under (Baki), (Record of Ragnarok)
 * and five more, none of them Vagabond. Danbooru qualifies costumes and ages
 * the same way, so this is for AO3 only.
 */
export const sharedElsewhere = (query: CharacterQuery, tag: string, others: string[]) => {
  const { names, qualifier } = parseTag(tag);
  if (qualifier !== null) return false;

  const franchise = franchiseWords(query.franchiseHints);
  const bare = names.map((name) => core(nameWords(name)));

  return others.some((other) => {
    const parsed = parseTag(other);
    if (parsed.qualifier === null) return false;
    const words = qualifierWords(parsed.qualifier);
    // "(One Piece Live Action)" is the same franchise, not another one.
    const foreign = words.length > 0 && !words.some((word) => franchise.has(word));
    return foreign && parsed.names.some((name) => bare.some((own) => same(core(nameWords(name)), own)));
  });
};

const QUALIFIER_ORDER: Record<TagFit['qualifier'], number> = { franchise: 0, none: 1, part: 2 };

/**
 * Best first: the higher rank, then the qualifier. One that names the
 * franchise wins - a catalogue only qualifies a name more than one character
 * has, so "Miyamoto Musashi (Vagabond)" beats "Miyamoto Musashi | Saber" -
 * and one that names a single part of it loses to no qualifier at all, which
 * is the character across the whole series.
 */
export const compareFits = (a: TagFit, b: TagFit) =>
  b.rank - a.rank || QUALIFIER_ORDER[a.qualifier] - QUALIFIER_ORDER[b.qualifier];
