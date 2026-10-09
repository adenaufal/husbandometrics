/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Two-colour print on newsprint ("Magazine"). Ink does almost everything;
        // vermilion is the spot colour, for the seal, the active control and the
        // No. 1 numeral only. Light only: it is print.
        mag: {
          paper: '#EFEBE2', // newsprint
          band: '#E5E0D4', // a second paper tone for bands and hover
          ink: '#121110', // sumi
          'ink-2': '#3A3833',
          muted: '#67635A', // 5.0:1 on paper, 4.5:1 on band
          red: '#C92C19', // 朱 vermilion, 4.6:1 on paper, 5.4:1 under white
        },
      },
      fontFamily: {
        // Loaded in index.html. Archivo is variable in width as well as weight:
        // the numerals and names are set extra-condensed through font-stretch.
        'mag-sans': ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mag-jp': ['"Zen Kaku Gothic New"', '"Hiragino Sans"', '"Yu Gothic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
