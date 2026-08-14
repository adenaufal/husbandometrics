/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ink and paper. The board is mostly type on a neutral ground, so the
        // greys carry the design and colour is reserved for meaning.
        paper: {
          light: '#fbfbfa',
          dark: '#0c0d10',
        },
        surface: {
          light: '#ffffff',
          dark: '#15171c',
        },
        line: {
          light: '#e7e6e3',
          dark: '#24262d',
        },
        ink: {
          light: '#16181d',
          dark: '#f4f4f2',
        },
        muted: {
          light: '#71717a',
          dark: '#8b8d96',
        },
        // The single accent, used for the brand mark and the active state.
        accent: {
          DEFAULT: '#c2410c',
          soft: '#fff1e9',
          dark: '#fb923c',
        },
        // Semantic only: these three never appear as decoration.
        rising: '#15803d',
        falling: '#b91c1c',
      },
      fontFamily: {
        display: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Satoshi', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        jp: ['"M PLUS Rounded 1c"', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        // The rank numeral, which is the largest type on a row.
        rank: ['2.25rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'rank-lg': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'slide-in': 'slideIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
