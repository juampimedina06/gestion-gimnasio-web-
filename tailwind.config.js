/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0C',
        'champagne-gold': '#D4AF37',
        volt: '#CCFF00',
        'volt-hover': '#B8E600',
        'gym-black': '#09090B',
        'dark-bg': '#0B0C0E',
        'dark-surface': '#111216',
        'dark-card': '#16171E',
        'dark-border': '#22242E',
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
