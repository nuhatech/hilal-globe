import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

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
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
        invert: {
          css: {
            '--tw-prose-links': '#6ee7b7',
            '--tw-prose-headings': '#f1f5f9',
            '--tw-prose-body': '#cbd5e1',
            '--tw-prose-bold': '#f1f5f9',
            '--tw-prose-quotes': '#94a3b8',
            '--tw-prose-quote-borders': '#059669',
            '--tw-prose-counters': '#94a3b8',
            '--tw-prose-bullets': '#64748b',
            '--tw-prose-hr': '#1e293b',
            '--tw-prose-th-borders': '#334155',
            '--tw-prose-td-borders': '#1e293b',
            '--tw-prose-code': '#e2e8f0',
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config
