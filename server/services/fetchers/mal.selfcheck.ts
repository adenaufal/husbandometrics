/**
 * Smallest runnable guard for the MyAnimeList read. Run with `npm run check`.
 *
 * Offline by design: it exercises the row parser against real board markup and
 * the matcher against the cases that actually went wrong, so it fails when the
 * logic breaks rather than when MAL is slow.
 *
 * Both halves have a history. The parser is a regex over MAL's markup, which is
 * the thing most likely to move under us - and a silent parse failure would read
 * as "nobody is on the board" rather than as an error. The matcher is where a
 * confident wrong match would get in: an earlier draft matched every character
 * whose name tokenized to nothing against `C.C.` and `T.K.`.
 */
import assert from 'node:assert/strict';
import { findOnBoard, parseBoard, type BoardEntry } from './mal';
import { tokenize, type CharacterQuery } from './types';

// --- parseBoard -------------------------------------------------------------
// Trimmed from the live board: two rows, one with both an animeography and a
// mangaography cell, one with a comma-formatted count.
const MARKUP = `
<tr class="ranking-list">
  <td class="people">
    <a class="fl-l ml12 mr8" href="https://myanimelist.net/character/1/Spike_Spiegel"></a>
    <div class="information mt24">
      <a href="https://myanimelist.net/character/1/Spike_Spiegel" class="fs14 fw-b">Spiegel, Spike</a>
      <div class="fs12 fn-grey6 text-ellipsis">(スパイク・スピーゲル)</div>
    </div>
  </td>
  <td class="animeography"><div class="title"><a href="https://myanimelist.net/anime/1/Cowboy_Bebop">Cowboy Bebop</a></div></td>
  <td class="mangaography"><div class="title"><a href="https://myanimelist.net/manga/173/Cowboy_Bebop">Cowboy Bebop</a></div></td>
  <td class="favorites">    49,285  </td>
</tr>
<tr class="ranking-list">
  <td class="people">
    <div class="information mt24">
      <a href="https://myanimelist.net/character/45627/Levi" class="fs14 fw-b">Levi</a>
    </div>
  </td>
  <td class="animeography"><div class="title"><a href="https://myanimelist.net/anime/16498/Shingeki_no_Kyojin">Shingeki no Kyojin</a></div></td>
  <td class="mangaography"></td>
  <td class="favorites">    146,805  </td>
</tr>`;

const parsed = parseBoard(MARKUP);
assert.equal(parsed.length, 2, `expected 2 rows, parsed ${parsed.length} - MAL markup may have moved`);
assert.deepEqual(parsed[0].name, ['spiegel', 'spike'], 'name cell is the bolded link text');
assert.equal(parsed[0].favorites, 49285, 'thousands separator must be stripped, not truncated');
assert.ok(parsed[0].works.has('bebop'), 'animeography and mangaography titles are what corroborate a match');
assert.equal(parsed[1].favorites, 146805, 'a row with an empty mangaography cell still parses');

// --- findOnBoard ------------------------------------------------------------
const entry = (name: string, works: string[], favorites: number): BoardEntry => ({
  favorites,
  name: tokenize(name),
  works: new Set(works.flatMap(tokenize)),
});

const ask = (name: string, franchiseHints: string[], aliases: string[] = []): CharacterQuery => ({
  name,
  aliases,
  franchiseHints,
});

const BOARD = [
  entry('Gojou, Satoru', ['jujutsu kaisen'], 64232),
  entry('Levi', ['shingeki no kyojin'], 146805),
  entry('Thorfinn', ['vinland saga'], 35995),
  entry('Hanako-kun', ['jibaku shounen hanako-kun'], 9657),
  entry('Honda, Hanako', ['asobi asobase'], 1934),
  entry('C.C.', [], 30000), // Tokenizes to nothing: the row that used to match everyone.
];

assert.equal(
  findOnBoard(ask('Satoru Gojou', ['JUJUTSU KAISEN']), BOARD)?.favorites,
  64232,
  'exact name plus an agreeing franchise is the ordinary case',
);

// MAL romanises titles, so "Attack on Titan" shares no token with "Shingeki no
// Kyojin". A sole exact name match on the whole board is taken without it.
assert.equal(
  findOnBoard(ask('Levi', ['Attack on Titan']), BOARD)?.favorites,
  146805,
  'a uniquely-named character survives a franchise the two catalogues spell differently',
);

// Name is a subset in either direction - ours is longer here, MAL's is longer
// for Hanako - and the franchise is what makes it safe.
assert.equal(
  findOnBoard(ask('Thorfinn Karlsefni', ['Vinland Saga']), BOARD)?.favorites,
  35995,
  'MAL files Thorfinn without the surname',
);
assert.equal(
  findOnBoard(ask('Hanako', ['Toilet-bound Hanako-kun']), BOARD)?.favorites,
  9657,
  'the franchise separates Hanako-kun from Honda Hanako',
);

// The null rule: anything the franchise cannot settle stays unmeasured.
assert.equal(
  findOnBoard(ask('Hanako', ['Some Unrelated Show']), BOARD),
  null,
  'two plausible names and no corroboration is a null, not a guess',
);
assert.equal(
  findOnBoard(ask('Nobody At All', ['Nothing']), BOARD),
  null,
  'a character off the board reads null, never zero',
);
assert.equal(
  findOnBoard(ask('C.C.', ['Code Geass']), BOARD),
  null,
  'a name that tokenizes to nothing must not match every empty-named row',
);

// A nickname must not be able to outvote the real name. Gintoki is one row on
// the board and twenty-one aliases deep; pooling every name made him ambiguous
// and cost a real reading.
const NICKNAMED = [
  entry('Sakata, Gintoki', ['gintama'], 76840),
  entry('Joestar, Johnny', ['jojo no kimyou na bouken'], 19000),
  entry('Johnny', ['some other show'], 500),
];
assert.equal(
  findOnBoard(ask('Gintoki Sakata', ['Gintama'], ['Johnny', 'Gin-chan', 'Kintoki']), NICKNAMED)?.favorites,
  76840,
  'the real name resolves before an alias is consulted',
);

// Romanised titles are mostly particles. Two rows share a name here, so the
// franchise is the only thing that can separate them - and if `no` counts as
// corroboration it confirms both, the lookup goes ambiguous, and a real reading
// is lost. Only the meaningful tokens may vote.
const NAMESAKES = [
  entry('Satou, Yuu', ['kimetsu no yaiba'], 1200),
  entry('Satou, Yuu', ['boku no hero academia'], 3400),
];
assert.equal(
  findOnBoard(ask('Yuu Satou', ['Boku no Hero Academia']), NAMESAKES)?.favorites,
  3400,
  'a shared particle must not corroborate both namesakes into ambiguity',
);
assert.equal(
  findOnBoard(ask('Yuu Satou', ['Some Unrelated Show']), NAMESAKES),
  null,
  'two namesakes and nothing to separate them stays null',
);

console.log('mal selfcheck: ok');
