/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'tech-pink': '#ff5d8f',
        'holo-blue': '#4cc9f0',
        'deep-violet': '#7209b7',
        'soft-pink': '#ff8fa3',
        // Functional Colors
        'app-bg': '#f8f9fc',
        'modal-bg': '#f0f2f5',
        'success': '#06d6a0',
        'danger': '#ef476f',
        'warning': '#ffca3a',
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
        mplus: ['M PLUS Rounded 1c', 'sans-serif'],
        hand: ['Gochi Hand', 'cursive'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      perspective: {
        '500': '500px',
      },
    },
  },
  plugins: [],
}
