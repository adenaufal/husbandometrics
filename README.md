# 📊 HUSBANDOMETRICS - Objective Popularity Tracker for Male 2D Characters

Ever wondered who's actually the most popular husbando based on real data, not just vibes?

HUSBANDOMETRICS aggregates engagement metrics from multiple fan platforms to create objective, data-driven male character popularity rankings.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

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
- [ ] **Cron Jobs** - Automated weekly data refresh using Vercel Cron or GitHub Actions
- [ ] **Caching Strategy** - Redis/Upstash for API response caching
- [ ] **Rate Limiting** - Protect API endpoints from abuse
- [ ] **Database Migrations** - Version-controlled schema changes

### Phase 5: Community & Polish ✨
- [ ] **User Features**
  - [ ] Save favorite characters
  - [ ] Custom watchlists
  - [ ] Email notifications for rank changes
- [ ] **Social Features**
  - [ ] Share character cards (OG images)
  - [ ] Embed widgets for blogs/forums
- [ ] **Admin Dashboard**
  - [ ] Manual character curation
  - [ ] Data refresh triggers
  - [ ] Analytics overview
- [ ] **Mobile App** - React Native/PWA version

### Nice to Have 💡
- [ ] Multi-language support (EN/JP/KR/CN)
- [ ] Dark mode toggle
- [ ] Export rankings as CSV/JSON
- [ ] API for third-party developers
- [ ] Character request system
- [ ] Integration with MAL/AniList APIs

---

Built for the yumejoshi, fujoshi, and otaku community who want numbers, not opinions. 💜