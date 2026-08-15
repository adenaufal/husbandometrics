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
is optional.

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
| `mal` | character favourites (via Jikan) | anime, manga |
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

### History

`data/snapshots.json`, committed to the repo. One row per character per refresh,
newest-first on read, capped at two years, deduplicated per day — a
hand-triggered refresh must not weight that day's average by how often someone
pressed the button. A hosted database is a lot of moving parts for a board that
refreshes weekly and never takes a write from a visitor; Drizzle with Turso or
PlanetScale is still wired up and takes over when `DATABASE_PROVIDER` is set.

Snapshots are written as one batch, never one call per character: the file store
rewrites the whole file, so concurrent appends would race and keep only the last.

### The roster

- Anime and manga characters are discovered from AniList's favourites ranking,
  filtered to male. No hand-picking.
- Game characters come from `server/data/gameRoster.ts`. That list is editorial
  scope, not data — it decides who is covered and never supplies their numbers.

### Matching

Names do not line up across catalogues, and a confident wrong match is worse
than no match:

- Danbooru writes `surname_given` and its own romanisation (`todoroki_shoto`
  against AniList's "Shouto Todoroki"), so matching is by token with long vowels
  collapsed, and the franchise is the tie-breaker.
- AO3 needs the canonical character tag via `/autocomplete/character`. Free-text
  search returns 103,000 works for "Xiao" because it matches the substring
  anywhere. Pairing tags (`/`, `&`) count two characters and are excluded.
- AniList search hits are only accepted when the franchise corroborates them.
  Searching "Xiao" otherwise returns a character with 22,000 favourites who is
  not the Genshin Xiao.

### Rate limits

AO3 throttles hard and is paced at one request per 1.2s with backoff; Jikan at
one per 400ms. AO3 sets the wall clock: a warm refresh of ~100 characters takes
about five minutes, a cold one about twenty-two. Roster size is sized against
that budget, not against a web request.

## Design

**Direction:** quiet editorial. Type and whitespace carry the design; colour
carries meaning only.

The board is a ranking table, not a card grid: full-width rows in rank order,
large rank numeral, portrait, name, provenance dots, score. Detail opens in a
side panel, not a modal.

### Rules

- **Colour means something.** `rising` and `falling` mark trend; `accent` marks
  the brand mark and the active control. Nothing else is coloured. Portraits are
  the only large colour on the page.
- **Provenance is always visible.** Every row carries four dots showing which
  sources measured that character. A total averaged over two sources must never
  look as authoritative as one averaged over four.
- **No chart that flatters.** Scores cluster between roughly 60 and 96, so a bar
  drawn from zero fills to nearly the same width on every row and reads as
  agreement where there is none. The figure in a tabular column is the honest
  comparison. Same reason the trend column is hidden entirely until snapshots
  exist rather than filled with em dashes.
- **Show the arithmetic.** The detail panel prints the raw upstream figure beside
  each score so a reader can check it against the source.
- `tabular-nums` on every figure. Digits have to hold their column.

### Tokens

Defined in `tailwind.config.js`; use them, never raw hex.

`paper` (page) · `surface` (raised) · `line` (borders) · `ink` (text) ·
`muted` (secondary text) · `accent` · `rising` · `falling`

Each has `-light` and `-dark`. Dark mode is a `class` on `<html>`.

### Fonts

- **Satoshi** — display, body, and all figures (Fontshare)
- **M PLUS Rounded 1c** — Japanese names only; Satoshi has no kana

## File structure

```
husbandometrics/
├── index.html, index.tsx, index.css
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Header.tsx, Footer.tsx, Toolbar.tsx
│   │   ├── RankingTable.tsx, RankRow.tsx, SourceDots.tsx
│   │   ├── DetailPanel.tsx, MethodologyModal.tsx
│   ├── lib/          # i18n, search, history, images
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

- MyAnimeList reads 0/103. Jikan returns 504 (`"Jikan failed to connect to
  MyAnimeList"`) — upstream, not our bug. The fetcher degrades to `null`.
- Three game characters have no AniList portrait and fall back to a generated
  monogram.
- Trend needs two refreshes. The first snapshot has nothing to compare against,
  so every character reads STABLE and the trend column stays hidden until the
  second weekly run.
- Scores are relative, so a source failing for the character who holds its peak
  lifts everyone else's score on that source. Week-over-week movement is not
  purely popularity.
