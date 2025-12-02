# 📊 HUSBANDOMETRICS - Objective Popularity Tracker for Male 2D Characters

Ever wondered who's actually the most popular husbando based on real data, not just vibes?

HUSBANDOMETRICS aggregates engagement metrics from multiple fan platforms to create objective, data-driven male character popularity rankings. The frontend is built with **Vite + React + TypeScript**, so you get instant hot-module reloading during development and optimized builds without a separate Node.js app wrapper.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the Vite development server (default: http://localhost:5173)
npm run dev

# Build for production (generates Vite static assets)
npm run build

# Preview the production build locally
npm run preview

# Type checking for both client + server TypeScript
npm run lint
```

Vite defaults to [http://localhost:5173](http://localhost:5173) in dev mode.

## 🛠️ Automation & Ops

- **Scheduled refresh**: `node-cron` runs weekly (Mondays at 04:00 UTC) when the server boots. Disable with `DISABLE_JOBS=true` or trigger manually via `POST /api/rankings/refresh` (optionally secured with `REFRESH_TOKEN` + `x-refresh-token` header).
- **Caching**: Rankings and character detail responses are cached in Redis/Upstash when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set; otherwise, an in-memory TTL cache is used. Override TTL with `CACHE_TTL_SECONDS`.
- **Rate limiting**: All `/api/*` routes are protected by a sliding window limit (100 requests/min by default). Upstash is used when configured; otherwise, the in-memory store is used.
- **Database migrations**: Schema lives in `server/db/schema.ts` with SQL migrations in `drizzle/`. Configure the database target with `DATABASE_URL` and generate new migrations with `npx drizzle-kit generate`.

## 📁 Project Structure

```
husbandometrics/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Floating pill header
│   │   ├── CharacterCard.tsx # Ticket-style character cards
│   │   ├── FilterBar.tsx    # Filter and view controls
│   │   ├── DetailModal.tsx  # Character detail modal
│   │   ├── Footer.tsx       # App footer
│   │   └── AboutModal.tsx   # About/info modal
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Character, SourceType, Trend enums
│   ├── lib/                 # Utilities and constants
│   │   └── constants.ts     # Mock character data
│   ├── data/                # Static data files
│   │   └── seed-characters.json
│   └── App.tsx              # Main app with React Query
├── index.tsx                # App entry point
├── index.html               # HTML template with font loading
├── index.css                # Global styles + Tailwind directives
├── tailwind.config.js       # Custom theme configuration
├── postcss.config.js        # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Tech Pink**: `#ff5d8f` - Primary brand color
- **Holo Blue**: `#4cc9f0` - Secondary accent
- **Deep Violet**: `#7209b7` - Tertiary accent
- **Success**: `#06d6a0` - Rising trends
- **Danger**: `#ef476f` - Falling trends
- **Warning**: `#ffca3a` - Rank #1 gold

### Typography
- **Display/Headings**: Satoshi (Fontshare)
- **Body/UI**: M PLUS Rounded 1c (Google Fonts)
- **Handwritten**: Gochi Hand (Google Fonts)

### Components
- **CharacterCard**: Ticket-style design with cutout circles and 3D hover
- **Header**: Floating pill with glassmorphism
- **DetailModal**: Dossier/folder aesthetic with radar charts
- **FilterBar**: Tech pill tabs with smooth transitions

## 📊 Data Sources
- 🎨 **Pixiv** - Fanart illustration counts
- 📝 **AO3** - Fanfiction engagement metrics
- 🔍 **Google Trends** - Search interest data
- 🖼️ **Booru** - Archived fan content tags
- 🐦 **Twitter** - Social media engagement

## ✨ Features
- ✅ Global character rankings
- ✅ Trend tracking (Rising/Stable/Falling)
- ✅ Filter by source type (Anime/Game/Manga)
- ✅ Real-time search
- ✅ Score breakdown with radar charts
- ✅ Responsive design
- ✅ React Query for data management
- ✅ TypeScript for type safety

## 🔧 Tech Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🎯 Roadmap & Future Enhancements

### Phase 2: Data Pipeline 🔄
- [x] **Backend API** - Implement Hono/Next.js API routes for data fetching
- [x] **Database Layer** - Set up Drizzle ORM + Turso (SQLite edge) or PlanetScale (MySQL)
- [x] **Data Fetchers**
  - [x] Pixiv API integration (fanart counts)
  - [x] AO3 scraper (fanfiction metrics)
  - [x] Google Trends unofficial API (search trends)
  - [x] Danbooru API (booru archive tags)
  - [x] Twitter/X API (social engagement)
- [x] **Scoring Algorithm** - Normalize and weight metrics (0-100 scale)

### Phase 3: Advanced Features 📊
- [ ] **Historical Tracking** - Store weekly snapshots, display trend charts over time
- [ ] **Character Comparison** - Side-by-side radar charts for multiple characters
- [ ] **Advanced Filtering**
  - [ ] Filter by franchise/source
  - [ ] Time period selection (week/month/year)
  - [ ] Min/max score ranges
- [ ] **Search Improvements** - Fuzzy search, romaji/kanji support, character aliases

### Phase 4: Automation & Scale 🚀
- [x] **Cron Jobs** - Automated weekly data refresh using node-cron (compatible with Vercel Cron/GitHub Actions triggers)
- [x] **Caching Strategy** - Redis/Upstash-backed cache with in-memory fallback for rankings API responses
- [x] **Rate Limiting** - Middleware to protect API endpoints from abuse
- [x] **Database Migrations** - Version-controlled schema changes via Drizzle

### Phase 5: Community & Polish ✨
- [x] **User Features**
  - [x] Save favorite characters
  - [x] Custom watchlists
  - [x] Email notifications for rank changes
- [x] **Social Features**
  - [x] Share character cards (OG images)
  - [x] Embed widgets for blogs/forums
- [x] **Admin Dashboard**
  - [x] Manual character curation
  - [x] Data refresh triggers
  - [x] Analytics overview
- [x] **Mobile App** - React Native/PWA version

### Nice to Have 💡
- [x] Multi-language support (EN/JP/KR/CN)
- [x] Dark mode toggle
- [x] Export rankings as CSV/JSON
- [x] API for third-party developers
- [x] Character request system
- [x] Integration with MAL/AniList APIs

---

Built for the yumejoshi, fujoshi, and otaku community who want numbers, not opinions. 💜