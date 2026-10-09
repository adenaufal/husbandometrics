# HUSBANDOMETRICS

Popularity rankings for male 2D characters, measured from public sources.

The product claim is measurement. Everything in here follows from that: no
sample data, no estimated figures, and no source shown as a number unless it was
actually read.

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v3
- Hono (API, run on Node via `@hono/node-server`)
- Drizzle ORM, optional Turso (SQLite) or PlanetScale (MySQL)
- Recharts
- TanStack Query

## Commands

```bash
npm run dev          # Vite on :3000, reads the committed public/rankings.json
npm run snapshot     # read every source, write public/rankings.json (~4 min)
npm run server       # Hono API on :3001, only for developing against live reads
npm run build        # tsc && vite build
npm run lint         # tsc --noEmit
npm run check        # scoring + snapshot-store self-checks
```

`npm run dev` alone is enough: production is static and the board ships as a
file. Copy `.env.example` to `.env.local` before `npm run snapshot`; every value
is optional. In development, `?simulate=loading` and `?simulate=error` render
those states on demand.

## Deployment

There is no API in production. A GitHub Action runs `npm run snapshot` weekly,
commits `public/rankings.json` and `data/snapshots.json`, and the host redeploys
on the push. The page fetches `/rankings.json`.

This is not just simplicity: a cold read takes about four minutes, and no
serverless request timeout tolerates that — Netlify allows 30s for a synchronous
or scheduled function, and a background function returns 202 without serving a
response.

`server/` still runs and is still the thing the snapshot script calls into, but
nothing deployed talks to it over HTTP.

## Data model

### Sources

Four, all read live, none requiring an API key:

| Source | Counts | Applies to |
| --- | --- | --- |
| `anilist` | character favourites | anime, manga |
| `mal` | character favourites | anime, manga |
| `ao3` | works under the canonical character tag | all |
| `danbooru` | posts under the character tag | all |

AniList and MyAnimeList catalogue anime and manga only. They return a figure for
some game characters through tie-in manga, but that measures catalogue coverage
rather than popularity, so both are treated as not applicable to `GAME`.

### The null rule

`null` means no reading. It never means zero, and it is never filled in.

- A source with no reading is excluded from the weighted mean, and the weights
  renormalise across the sources that did return one.
- The UI shows it as "Not measured", never as a 0 bar.
- A character measured by fewer than two sources is left off the board entirely
  — one reading is not a ranking.

There is no synthetic fallback anywhere in the codebase. An earlier version
generated hash-based numbers for unreachable sources; they were indistinguishable
from measurements once they reached the ranking. Do not reintroduce them.

### Scoring

Each source is scored relative to the highest reading on the board for that
source, on a log scale: `100 * log1p(value) / log1p(peak)`. 100 means "the most
measured here", not "the maximum possible". The counts are heavy-tailed, so a
fixed divisor would need re-tuning constantly and a linear scale would leave
everyone below the top few indistinguishable.

Weights live in `.env` (`WEIGHT_ANILIST` etc.) and default to
0.35 / 0.25 / 0.2 / 0.2.

### Tag cache

`data/tags.json`, committed. Half of an AO3 read is spent resolving which tag a
character is filed under — "Zhongli (Genshin Impact)", "Bakugou Katsuki" — and
that answer changes about never. Remembering it halves the requests to the
slowest source and turns each Danbooru search into a single count, taking a
refresh from roughly 22 minutes to 5. A stale tag returns nothing, and the
fetcher re-resolves it in place.

Every remembered tag is checked against the character's names on each refresh
(`fitTag`, under Matching); one that names someone else is dropped and
resolved again. The cache used to be trusted outright, and by 2026-10-09 it
held 51 tags, for 37 of the 103 characters, that named someone else — Lelouch
counted under `rem_(re:zero)`, Luffy under a two-post
`red_xiii_(rubber_harness)` — every week. Changing the matching rules means
re-resolving the cache, not just validating it: a tag can fit the rules and
still lose to a better one.

### History

`data/snapshots.json`, committed to the repo. One row per character per refresh,
newest-first on read, capped at two years, deduplicated per day — a
hand-triggered refresh must not weight that day's average by how often someone
pressed the button. A hosted database is a lot of moving parts for a board that
refreshes weekly and never takes a write from a visitor; Drizzle with Turso or
PlanetScale is still wired up and takes over when `DATABASE_PROVIDER` is set.

Snapshots are written as one batch, never one call per character: the file store
rewrites the whole file, so concurrent appends would race and keep only the last.

### Derived on the page

`src/lib/board.ts` recombines figures already in `rankings.json`; nothing there
estimates. `BoardProvider` (`src/lib/board-context.tsx`) computes them once, from
the whole board, never the filtered view:

- **Last week's rank**, rebuilt from each character's history. Checked against the
  board published on 2026-09-28: all 91 ranks matched. Someone missing from the
  previous board is "returning" or "new", never "unranked".
- **Peaks** per source, which every score is relative to. When the holder is off
  the board the peak is back-solved from stored scores, and shown as approximate.
- **The arithmetic** for a character: raw figure, score, renormalised share and
  contribution per source. `consistent` is false when the terms do not rebuild
  the published total; print the sum only when it is true.
- **Late starts**: the first refresh each source returned anything. MyAnimeList
  started on 2026-08-25, so totals step there for reasons of method.

### The roster

- Anime and manga characters are discovered from AniList's favourites ranking,
  filtered to male. No hand-picking.
- Game characters come from `server/data/gameRoster.ts`. That list is editorial
  scope, not data — it decides who is covered and never supplies their numbers.

### Matching

Names do not line up across catalogues, and a confident wrong match is worse
than no match:

- Danbooru writes `surname_given` and its own romanisation (`todoroki_shoto`
  against AniList's "Shouto Todoroki"), so names are compared as sets of words
  with long vowels and doubled letters collapsed, and searched a word at a time.
- AO3 needs the canonical character tag via `/autocomplete/character`. Free-text
  search returns 103,000 works for "Xiao" because it matches the substring
  anywhere. Pairing tags (`/`, `&`) count two characters and are excluded.
- Which candidate is the character is `fitTag`'s call
  (`server/services/fetchers/tagMatch.ts`), never post count's. It is generous
  about spelling and strict about identity:
  - A tag's name has to *be* one of the character's names, not contain one:
    `rem_(re:zero)` contains Lelouch's alias "Zero". Spelling may differ —
    "Gon Freecs", "Korosensei", and one long word a letter off ("Chrollo
    Lucifer" for "Lucilfer") — but the words may not.
  - A qualifier has to name the franchise, every word of it.
    `miyamoto_musashi_(fate)` is not Vagabond's Musashi,
    `zhongli_(archon)_(genshin_impact)` is a costume, and "no" alone is not
    Shingeki *no* Kyojin. AO3's part-of-a-series qualifiers count ("JoJo:
    Battle Tendency"), below a bare tag.
  - The real name outranks an alias, and a one-word alias counts only under the
    franchise's qualifier. AniList lists nicknames — "Zero", "Kira", "Sukea" —
    that are tags of their own, or other characters'.
- AO3 leaves a shared name bare for its best-known bearer and qualifies the
  rest. A bare tag whose name also appears under other franchises' qualifiers,
  and not under this one's, is someone else's: "Miyamoto Musashi | Saber" is
  Fate's, so Vagabond's Musashi reads "Not measured" on AO3.
- Danbooru keeps some names only as aliases: `lelouch_lamperouge` has no posts
  and points at `lelouch_vi_britannia`, a name AniList does not list. The alias
  is what gets remembered, and counting it counts its target.
- AniList search hits are only accepted when the franchise corroborates them.
  Searching "Xiao" otherwise returns a character with 22,000 favourites who is
  not the Genshin Xiao.

### Rate limits

AO3 throttles hard and is paced at one request per 1.2s with backoff; MAL's
board at one per 1.1s, but that is 20 requests for the whole roster rather than
one per character. AO3 sets the wall clock: a warm refresh of ~100 characters takes
about five minutes, a cold one about twenty-two. Roster size is sized against
that budget, not against a web request.

## Design

**Direction:** "Magazine" — the character-popularity results page of a Japanese
manga weekly, rebuilt as a live board and printed in two colours on newsprint.
The strapline is the claim: 人気ランキング — *measured, not voted*. Never call it
a poll or a vote (人気投票): nothing on this site is voted.

The page reads like a results spread. 1位〜3位 is a feature, with slanted manga
panel gutters and vertical Japanese names. 4位〜10位 is a band of seven panels,
and 11位〜 a dense three-column listing. A search skips the spread and lists the
matches. A type filter fills the spread from the filtered board, but every
numeral keeps the character's real board rank. A profile opens as a side panel
(a full-screen sheet on phones); the methodology as the magazine's editorial
column.

Light only: it is print.

### Rules

- **Colour means something.** Ink does almost everything. Vermilion (`mag-red`)
  is the one spot colour, used only for the 計 seal, the active control, the
  No. 1 numeral and the top rule of the error notice. Trend marks are ink ▲ / ▼:
  the shape carries the meaning. Portraits are the only other colour.
- **Provenance is always visible.** Every entry carries four squares, filled where
  a source returned a reading, in fixed order AniList · MAL · AO3 · Danbooru. A
  total averaged over two sources must never look as authoritative as one
  averaged over four.
- **No chart that flatters.** Scores cluster between roughly 60 and 96, so a bar
  drawn from zero reads as agreement where there is none; the figure is the
  comparison. The history chart uses one vertical scale for the whole board and
  marks the day a source started being read, so a change of method never reads
  as a change in popularity.
- **Show the arithmetic.** The profile prints each source's raw figure, score,
  share and contribution, and the sum beneath them.
- **No movers spotlight.** Week-over-week movement is partly measurement (see
  Known gaps). Per-entry trend marks are fine; a "biggest movers" module is not.
- `tabular-nums` on every figure. Square corners everywhere.
- Portraits are 230×345 at source. Never display one much wider than 300px.

### Tokens

Defined in `tailwind.config.js` under `mag`; use them, never raw hex.

`mag-paper` (newsprint) · `mag-band` (second paper tone, hover) · `mag-ink` ·
`mag-ink-2` (secondary ink) · `mag-muted` (secondary text) · `mag-red` (vermilion)

Hand-set print pieces — panels and their slanted cuts, screentone, vertical
type, the seal, the width steps `mag-x62` / `mag-x75` / `mag-x87` — are classes
in `src/components/magazine.css`, prefixed `mag-`.

### Fonts

Loaded in `index.html`.

- **Archivo** for everything Latin. It is variable in width as well as weight,
  and the numerals and names are set extra-condensed through `font-stretch`.
- **Zen Kaku Gothic New** for Japanese names and labels. A few names on the
  board are Chinese or Korean and use glyphs it lacks; `useFallbackGlyphs`
  fetches only those from Noto Sans SC / KR.

### Copy

Two tables, both in four languages: shared keys in `src/lib/i18n.tsx` through
`t()`, and the board's own furniture in `src/components/strings.ts` through
`useMagStrings()`, which is typed and interpolates `{var}`. The methodology text
in `src/lib/methodology.ts` is English in every language.

## File structure

```
husbandometrics/
├── index.html, index.tsx, index.css   # fonts load in index.html
├── src/
│   ├── App.tsx
│   ├── components/   # the board
│   │   ├── Board.tsx                         # page, sections, overlays
│   │   ├── Masthead.tsx, Controls.tsx, Colophon.tsx
│   │   ├── Spread.tsx, Band.tsx, Listing.tsx  # 1–3, 4–10, 11+
│   │   ├── DetailPanel.tsx, HistoryChart.tsx  # the profile; chart lazy-loads
│   │   ├── Methodology.tsx, States.tsx
│   │   ├── parts.tsx     # source marks, trend marks, panels, numerals, seal
│   │   ├── format.ts, strings.ts, useDialog.ts, useFallbackGlyphs.ts
│   │   └── magazine.css
│   ├── lib/          # board-context, board, methodology, i18n, search,
│   │                 # history, images
│   └── types/        # Character, ScoreBreakdown, METRIC_SOURCES
├── scripts/build-snapshot.ts   # writes public/rankings.json
├── data/snapshots.json         # committed history
├── data/tags.json              # remembered upstream tag names
├── public/rankings.json        # what production serves
├── .github/workflows/          # weekly refresh
├── server/
│   ├── index.ts
│   ├── config/env.ts
│   ├── data/gameRoster.ts
│   ├── db/           # client, repository, fileStore, schema/{sqlite,mysql}
│   ├── lib/cache.ts
│   ├── middleware/rateLimit.ts
│   ├── routes/       # rankings, integrations
│   ├── services/     # aggregator, fetchers/
│   ├── tasks/scheduler.ts
│   └── utils/metrics.ts
└── drizzle/
```

## Known gaps

- MyAnimeList covers the favourites board's top 1,000 only. That is the whole
  roster today, but a character who is on our board and outside that window
  reads `null`. Raise `MAL_TOP_CHARACTERS` if it starts costing readings.
- Three game characters have no AniList portrait and fall back to a generated
  monogram.
- Trend needs two refreshes. The first snapshot has nothing to compare against,
  so every character reads STABLE until the second weekly run.
- Scores are relative, so a source failing for the character who holds its peak
  lifts everyone else's score on that source. Week-over-week movement is not
  purely popularity.
- History before 2026-10-09 was read under the old tags (see Tag cache). The 37
  characters whose tags were corrected step on that day for reasons of method:
  Luffy reads "last week No. 93" against his first correct reading at No. 1.
  The rows only store scores, not the counts behind them, so they cannot be
  recomputed; they are left as read.
