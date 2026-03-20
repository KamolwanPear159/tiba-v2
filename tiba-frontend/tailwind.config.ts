import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003087',
          light: '#0047B3',
          dark: '#001F5C',
        },
        accent: {
          DEFAULT: '#E8A020',
          light: '#F0B840',
          dark: '#C07010',
        },
        background: '#F8F9FA',
        'text-main': '#1A1A2E',
      },
      fontFamily: {
        sans: ['var(--font-thai)', 'Sarabun', 'Noto Sans Thai', 'sans-serif'],
        eng: ['var(--font-eng)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
