/**
 * Smallest runnable guard for tag matching. Run with `npm run check`.
 *
 * Offline, and every case is real: a tag AO3 or Danbooru actually returned, for
 * a character actually on the board, with the names and titles AniList gives
 * them. Most of the rejected tags were once remembered as that character's and
 * counted every week.
 */
import assert from 'node:assert/strict';
import { compareFits, fitTag, sharedElsewhere } from './tagMatch';
import { tokenize, words, type CharacterQuery } from './types';

const character = (name: string, aliases: string[], franchiseHints: string[]): CharacterQuery => ({
  name,
  aliases,
  franchiseHints,
});

const rank = (query: CharacterQuery, tag: string) => fitTag(query, tag)?.rank ?? null;

/** True when `better` sorts ahead of `worse`. */
const outranks = (query: CharacterQuery, better: string, worse: string) =>
  compareFits(fitTag(query, better)!, fitTag(query, worse)!) < 0;

// --- words ------------------------------------------------------------------
assert.deepEqual(words('Ryōmen Sukuna'), ['ryomen', 'sukuna'], 'an accent is not a word break');
assert.deepEqual(tokenize('Eren Jäger'), ['eren', 'jager']);
assert.deepEqual(words('L Lawliet'), ['l', 'lawliet'], 'an initial is a word');
assert.deepEqual(words('monkey_d._luffy'), ['monkey', 'd', 'luffy'], 'an underscore is a space');

// --- a name, not a word inside one -------------------------------------------
const lelouch = character(
  'Lelouch Lamperouge',
  ['Lulu', 'Zero', 'King of Elevens', 'The Demon', 'Black King', 'Black Demon', 'Julius Kingsley'],
  ['Code Geass: Lelouch of the Rebellion', 'Code Geass: Hangyaku no Lelouch'],
);
assert.equal(rank(lelouch, 'rem_(re:zero)'), null, '"Zero" is his alias and part of her franchise');
assert.equal(rank(lelouch, 'The Black King (Code Geass)'), null);
assert.equal(rank(lelouch, 'Lelouch Lamperouge | Lelouch vi Britannia'), 3);
assert.equal(rank(lelouch, 'lelouch_lamperouge'), 3);

const eren = character(
  'Eren Yeager',
  ['Eren Jaeger', 'Eren Jäger', 'Suicidal Maniac'],
  ['Attack on Titan', 'Shingeki no Kyojin'],
);
assert.equal(rank(eren, 'fern_(sousou_no_frieren)'), null, '"no" names no franchise');
assert.equal(rank(eren, 'eren_yeager'), 3);

const luffy = character(
  'Luffy Monkey',
  ['Mugiwara (麦わら)', 'Straw Hat', 'Straw Hat Luffy', 'Rubber', 'Monkey D. Rufy'],
  ['ONE PIECE', 'One Piece', 'One Piece Film: Red'],
);
assert.equal(rank(luffy, 'red_xiii_(rubber_harness)'), null);
assert.equal(rank(luffy, 'Straw Hat Fleet (One Piece)'), null);
assert.equal(rank(luffy, "Monkey D. Luffy's Straw Hat"), null, 'his hat, not him');
assert.equal(rank(luffy, 'monkey_d._luffy'), 3, 'word order and initials do not matter');

const zoro = character('Zoro Roronoa', ['Zolo', 'Pirate Hunter', 'Lorenor Zorro'], ['ONE PIECE', 'One Piece']);
assert.equal(rank(zoro, 'zolo'), null, 'a one-word alias needs the franchise behind it');
assert.equal(rank(zoro, 'roronoa_zoro'), 3);

const jingYuan = character(
  'Jing Yuan',
  ['General Jing Yuan', 'The Dozing General'],
  ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'],
);
assert.equal(rank(jingYuan, 'jingliu_(honkai:_star_rail)'), null, 'same franchise, someone else');
assert.equal(rank(jingYuan, 'jing_yuan'), 3);
assert.equal(rank(jingYuan, 'jing_yuan_(young)'), null, 'a form is not the character');

const light = character('Light Yagami', ['Kira', 'Light Asahi', 'God'], ['Death Note', 'DEATH NOTE']);
assert.equal(rank(light, 'kira_yoshikage'), null);
assert.equal(rank(light, 'Potato Chip Eaten By Yagami Light'), null, 'one word more than the name, never four');
assert.equal(rank(light, 'Yagami Light'), 3);

// --- qualifiers ----------------------------------------------------------------
const musashi = character('Musashi Miyamoto', ['Shinmen Takezo', 'Demon'], ['Vagabond', 'Vagabond: Saigo no Manga-ten']);
assert.equal(rank(musashi, 'miyamoto_musashi_(fate)'), null);
assert.ok(
  outranks(musashi, 'miyamoto_musashi_(vagabond)', 'Miyamoto Musashi | Saber'),
  'a catalogue only qualifies a name more than one character has',
);
// What AO3 suggests for "Musashi Miyamoto": the bare name is the best-known
// Musashi's, and nothing here is Vagabond's.
const offered = [
  'Musashi Miyamoto (A3!)',
  'Miyamoto Musashi | Saber',
  'Niten | Miyamoto Musashi',
  'Miyamoto Musashi (Baki)',
  'Miyamoto Musashi (Record of Ragnarok)',
  'Miyamoto Musashi (?-1645)',
];
assert.ok(sharedElsewhere(musashi, 'Miyamoto Musashi | Saber', offered));
assert.ok(!sharedElsewhere(light, 'Yagami Light', ['Yagami Light', 'Warrior of Light (Final Fantasy XIV)', 'Light']));

const zhongli = character('Zhongli', ['Rex Lapis', 'Morax'], ['Genshin Impact', 'Yuanshen']);
assert.equal(rank(zhongli, 'zhongli_(genshin_impact)'), 3);
assert.equal(rank(zhongli, 'zhongli_(archon)_(genshin_impact)'), null, 'a costume is not the character');
assert.equal(rank(zhongli, "Zhongli's Parents (Genshin Impact)"), null);

const kamina = character('Kamina', ['Aniki (Bro)'], ['Gurren Lagann', 'Tengen Toppa Gurren Lagann']);
assert.equal(rank(kamina, 'kamina_(ttgl)'), 3, "the title's acronym is the title");

const joseph = character(
  'Joseph Joestar',
  ['JoJo', 'Josef Joestar', 'Old Man'],
  ["JoJo's Bizarre Adventure (TV)", 'JoJo no Kimyou na Bouken (TV)', "JoJo's Bizarre Adventure: Stardust Crusaders"],
);
assert.deepEqual(
  fitTag(joseph, 'Joseph Joestar (JoJo: Battle Tendency)'),
  { rank: 3, qualifier: 'part' },
  'AO3 qualifies him by the part of the series he leads',
);
assert.equal(rank(joseph, 'Fumi | Joseph Joestar (JoJolion)'), null);
assert.equal(rank(joseph, 'kars_(jojo)'), null);
assert.equal(rank(joseph, 'Jojo'), null);

// --- spellings ------------------------------------------------------------------
const gon = character('Gon Freecss', [], ['Hunter x Hunter (2011)', 'HUNTER×HUNTER (2011)', 'Hunter x Hunter']);
assert.equal(rank(gon, 'Gon Freecs'), 3, 'doubled letters are a spelling, not a different name');
assert.equal(rank(gon, "Abe | Gon Freecs' Great-Grandmother"), null);

const koro = character('Koro-sensei', ['Octopus', 'Demon King'], ['Assassination Classroom', 'Ansatsu Kyoushitsu']);
assert.equal(rank(koro, 'Korosensei (Assassination Classroom)'), 3, 'the same words, run together');
assert.equal(rank(koro, 'koro-sensei'), 3);
assert.equal(rank(koro, 'demon_king_of_salvation'), null);

const chrollo = character(
  'Chrollo Lucilfer',
  ['Kuroro Rushirufuru', 'Danchou'],
  ['Hunter x Hunter (2011)', 'HUNTER×HUNTER (2011)', 'Hunter x Hunter'],
);
assert.equal(rank(chrollo, 'Kuroro Lucifer | Chrollo Lucifer'), 2, 'one long word a letter off');
assert.equal(rank(chrollo, 'Danchou | Captain (Granblue Fantasy)'), null);

// --- part of the name, or one word more ------------------------------------------
const l = character(
  'L Lawliet',
  ['Ryuga Hideki', 'Ryuzaki', 'Eraldo Coil', 'Deneuve', 'Asahi', 'Suzuki', 'L-Prime'],
  ['Death Note', 'DEATH NOTE'],
);
assert.equal(rank(l, 'L (Death Note)'), 2);
assert.equal(rank(l, 'Kim Myungsoo | L'), null, 'part of a name needs the franchise behind it');
assert.equal(rank(l, 'serizawa_asahi'), null);
assert.ok(outranks(l, 'L (Death Note)', 'Deneuve (Death Note)'), 'his name outranks his alias');

const thorfinn = character('Thorfinn Karlsefni', ['Thorsson'], ['Vinland Saga', 'VINLAND SAGA']);
assert.equal(
  rank(thorfinn, 'Þorfinnur karlsefni | Thorfinn Karlsefni (fl. 11th Century)'),
  null,
  'the explorer, not the character',
);
assert.equal(rank(thorfinn, 'Thorfinn Rowle'), null);
assert.equal(rank(thorfinn, 'Thorfinn (Vinland Saga)'), 2);
assert.equal(rank(thorfinn, 'thorfinn_thorsson'), 1);

const levi = character(
  'Levi',
  ['Levi Heichou (リヴァイ兵長)', 'Captain Levi', "Humanity's Strongest Soldier"],
  ['Attack on Titan', 'Shingeki no Kyojin'],
);
assert.equal(rank(levi, 'Levi Ackerman'), 2);
assert.equal(rank(levi, 'levi_(shingeki_no_kyojin)'), 3);
assert.equal(rank(levi, 'levi_(fear_&_hunger)'), null);

const law = character('Law Trafalgar', ['Surgeon of Death', 'Traffy', 'Torao'], ['ONE PIECE', 'One Piece']);
assert.equal(rank(law, 'Trafalgar D. Water Law'), 2, 'his full name has a middle one');
assert.equal(rank(law, 'toraou'), null);

const jinWoo = character(
  'Jin-U Seong',
  ['Sung Jin-Woo', 'Shun Mizushino (水篠旬)', "World's Weakest Hunter"],
  ['Solo Leveling', 'Ore dake Level Up na Ken'],
);
assert.equal(rank(jinWoo, 'Jin Geum Seong'), null, 'an initial is part of the name');
assert.equal(rank(jinWoo, 'Sung Jin-Woo (Solo Leveling)'), 1);

const mob = character('Shigeo Kageyama', ['Mob (モブ)', 'Shige'], ['Mob Psycho 100']);
assert.equal(rank(mob, 'Kageyama "Mob" Shigeo'), 3, 'a quoted nickname is set aside');
assert.equal(rank(mob, 'kageyama_tobio'), null);
assert.equal(rank(mob, 'ekubo_(mob_psycho_100)'), null);

// --- the name outranks an alias --------------------------------------------------
const kakashi = character('Kakashi Hatake', ['The Copy Ninja', 'Sukea'], ['Naruto', 'NARUTO: Shippuuden']);
assert.ok(outranks(kakashi, 'hatake_kakashi', 'sukea_(naruto)'));

const gintoki = character(
  'Gintoki Sakata',
  ['Yorozuya', 'Shiroyasha', 'Kintoki', 'Ginpachi Sakata (坂田銀八)'],
  ['Gintama', 'Gintama Season 3'],
);
assert.ok(outranks(gintoki, 'sakata_gintoki', 'sakata_kintoki_(gintama)'), 'Kintoki is his robot double');

console.log('tagMatch selfcheck: ok');
