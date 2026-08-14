# Husbandometrics

Popularity rankings for male 2D characters, measured from public sources.

Forty characters, ranked by a weighted mean of four live readings. Nothing on the
board is estimated, sampled, or filled in: when a source cannot be read it is
marked "Not measured" and left out of the total rather than counted as zero.

## Quick start

```bash
npm install
cp .env.example .env.local   # every value is optional

npm run server               # Hono API on :3001
npm run dev                  # Vite on :3000, proxies /api to :3001
```

Two terminals. The first read of `/api/rankings` queries four sources for every
character and takes about four minutes; it is then cached for six hours.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on :3000 |
| `npm run server` | Hono API on :3001 (`server:dev` for watch mode) |
| `npm run build` | `tsc && vite build` |
| `npm run lint` | `tsc --noEmit` over client and server |
| `npm run check` | Scoring self-check |

## Data sources

All four are read live and none needs an API key.

| Source | Counts | Applies to |
| --- | --- | --- |
| AniList | character favourites | anime, manga |
| MyAnimeList (via Jikan) | character favourites | anime, manga |
| AO3 | works under the canonical character tag | all |
| Danbooru | posts under the character tag | all |

AniList and MyAnimeList catalogue anime and manga only. They do return a figure
for some game characters through tie-in manga, but that measures catalogue
coverage rather than popularity, so both are treated as not applicable to game
characters — who are scored on AO3 and Danbooru.

## Scoring

Each source is scored against the highest reading on the board for that source,
on a log scale:

```
score = 100 * log1p(value) / log1p(peak)
```

100 means "the most measured on this source", not "the maximum possible". The
counts are heavy-tailed — the top AniList character has roughly 200× the
favourites of the median tracked one — so a linear scale would leave everyone
below the top few indistinguishable, and a fixed divisor would need re-tuning
every time a franchise blows up.

The total is the weighted mean over the sources that returned a reading, with the
weights renormalised across them (`WEIGHT_ANILIST` and friends in `.env`). A
character measured by fewer than two sources is left off the board: one reading
is not a ranking.

## Who is on the board

Anime and manga characters are pulled from AniList's favourites ranking and
filtered to male characters — no hand-picking. Game characters come from a short
curated list in `server/data/gameRoster.ts`, because AniList and MyAnimeList do
not catalogue games and auto-discovery would erase every gacha character. That
list decides who is covered; it never supplies their numbers.

## Ops

- **Scheduled refresh** — `node-cron`, Mondays 04:00 UTC. Disable with
  `DISABLE_JOBS=true`, or trigger manually with `POST /api/rankings/refresh`
  (guard it with `REFRESH_TOKEN` plus the `x-refresh-token` header).
- **Caching** — Upstash Redis when `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are set, otherwise an in-process TTL cache. Six
  hours by default (`CACHE_TTL_SECONDS`).
- **Rate limiting** — 100 requests/min on `/api/*`, Upstash-backed when
  configured.
- **Database (optional)** — Drizzle with Turso or PlanetScale. Set
  `DATABASE_PROVIDER` and the matching connection variables, then
  `npx drizzle-kit generate`. Without one the API still works; only trend and
  history need stored snapshots.
- **Upstream limits** — AO3 is paced at one request per 1.2s with backoff, Jikan
  at one per 400ms. Both throttle aggressively.

## Structure

```
src/
  App.tsx
  components/   Header, Toolbar, RankingTable, RankRow, SourceDots,
                DetailPanel, MethodologyModal, Footer
  lib/          i18n, search, history, images
  types/        Character, ScoreBreakdown, METRIC_SOURCES
server/
  index.ts
  config/env.ts
  data/gameRoster.ts
  db/           client, repository, schema/{sqlite,mysql}
  services/     aggregator, fetchers/{anilist,mal,ao3,danbooru,http}
  tasks/scheduler.ts
  utils/metrics.ts
drizzle/
```

## Design

Quiet editorial: type and whitespace carry the design, colour carries meaning.
The board is a ranking table rather than a card grid, every row shows which
sources measured that character, and the detail panel prints the raw upstream
figure beside each score so a reader can check it. Conventions are in
`CLAUDE.md`.

## Known gaps

- **MyAnimeList reads 0/40.** Jikan returns `504 "Jikan failed to connect to
  MyAnimeList"` — upstream, not this codebase. The fetcher degrades to `null`.
- **Three game characters have no portrait** (Alhaitham, Blade, Wriothesley);
  AniList has no entry for them, so a generated monogram stands in.
- **Trend and history need a database.** Without stored snapshots there is no
  previous reading, so every character is STABLE and the trend column is hidden.

## Not built

Listed so nobody has to read the code to find out: character comparison, user
accounts, watchlists, notifications, OG image generation, embeddable widgets,
admin dashboard, and a mobile app. Multi-language (EN/JP/KR/CN), dark mode, CSV
export, and search over names, aliases, and franchises do exist.
