import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        red:    '#e8341c',
        green:  '#1db954',
        gold:   '#f0c060',
        bg:     '#0c0c0e',
        surface:'#141416',
        card:   '#1a1a1e',
      },
      animation: {
        'fade-up':  'fadeUp 0.38s ease both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) both',
      },
    },
  },
  plugins: [],
}
export default config
