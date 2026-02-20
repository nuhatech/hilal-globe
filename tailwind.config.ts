import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          DEFAULT: '#060a14',
          light: '#e8ecf2',
        },
        zone: {
          A: '#9AF99B',
          B: '#65A364',
          C: '#EAC078',
          D: '#E16665',
        },
      },
    },
  },
} satisfies Config
