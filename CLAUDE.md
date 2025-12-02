# HUSBANDOMETRICS

Data-driven popularity rankings for 2D male characters, aggregated from Pixiv, AO3, and fan communities worldwide.

## Tech Stack
- Vite + React 18 + TypeScript
- Tailwind CSS v3
- Hono (lightweight backend/API)
- Drizzle ORM + Turso (SQLite edge)
- Recharts
- Deploy: Vercel/Cloudflare Pages

## Design System Reference

### Aesthetic
**Style:** Kawaii-Tech / Y2K Futurist / "Decorated Notebook"
**Metaphors:** ID Cards, Event Tickets, Personnel Dossiers

### Colors
```css
/* Brand */
--tech-pink: #ff5d8f;
--holo-blue: #4cc9f0;
--deep-violet: #7209b7;
--soft-pink: #ff8fa3;

/* Functional */
--bg-main: #f8f9fc;
--bg-modal: #f0f2f5;
--card-surface: #ffffff;
--success: #06d6a0;
--danger: #ef476f;
--warning: #ffca3a;

/* Text */
--text-heading: #1e293b;
--text-body: #475569;
--text-muted: #94a3b8;
```

### Fonts
- **Display:** Satoshi (Black 900) - Fontshare
- **Body:** M PLUS Rounded 1c (500, 700) - Google Fonts
- **Handwritten:** Gochi Hand - Google Fonts

### Key Components

**Character Card ("The Ticket")**
- `bg-white border-2 border-slate-100 rounded-3xl`
- Decorative cutout circles (ticket stub effect)
- 3D perspective hover rotation
- Visual barcode element

**Header ("Floating Pill")**
- `bg-white/90 backdrop-blur-md rounded-full`
- `border border-slate-200/60 shadow-lg shadow-slate-200/20`

**Detail Modal ("The Dossier")**
- Split layout: Left profile, Right data
- Tape strips, stamps, paper clip decorations
- AI Note: `bg-[#fff9c4]` with handwritten font

**Filter Bar**
- `bg-white/50 backdrop-blur-sm`
- Active: `bg-white text-[#ff5d8f] ring-2 ring-[#ff5d8f]/20 scale-105`

### Animations
- Cards: `hover:-translate-y-2`
- Images: `group-hover:scale-110 group-hover:rotate-6`
- Keyframes: `fade-in-up`, `float`

## File Structure

```
husbandometrics/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── FilterBar.tsx
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterModal.tsx
│   │   ├── RadarChart.tsx
│   │   └── TrendBadge.tsx
│   ├── hooks/
│   │   └── useCharacters.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── scoring.ts
│   └── data/
│       └── characters.json
├── server/                    # Hono backend (optional, for data fetching)
│   ├── index.ts
│   ├── routes/
│   │   └── rankings.ts
│   └── db/
│       └── schema.ts
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

## Tailwind Config

```typescript
export default {
  theme: {
    extend: {
      colors: {
        'tech-pink': '#ff5d8f',
        'holo-blue': '#4cc9f0',
        'deep-violet': '#7209b7',
        'soft-pink': '#ff8fa3',
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
        body: ['M PLUS Rounded 1c', 'sans-serif'],
        hand: ['Gochi Hand', 'cursive'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
}
```

## Implementation Order

1. **Refactor** - Organize existing prototype into component structure
2. **Polish Components** - Ensure all ticket/dossier styling matches spec
3. **State Management** - React Query or Zustand for data fetching
4. **Backend (Phase 2)** - Hono API + Drizzle for real data
5. **Fetchers (Phase 3)** - Pixiv, AO3, Danbooru integrations

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run server       # Run Hono backend (if separate)
```