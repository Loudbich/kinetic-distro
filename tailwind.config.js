/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#08090A',
          800: '#0E1012',
          700: '#15181B',
          600: '#1E2226',
          500: '#2A2F35',
        },
        chrome: {
          DEFAULT: '#B8BEC7',
          400: '#8B929C',
          300: '#6B7280',
          200: '#4A5058',
        },
        paper: '#F4F2ED',
        signal: {
          DEFAULT: '#FF4D12',
          soft: '#FF7A47',
          deep: '#C22F00',
        },
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'Arial Black', 'sans-serif'],
        sans: ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        kinetic: '0.32em',
      },
      maxWidth: {
        grid: '1600px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '45%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        // The accent rule that draws itself across the top of the feed stage
        // each time the artwork changes.
        sweep: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        scan: 'scan 5.5s linear infinite',
        rise: 'rise 0.7s cubic-bezier(0.22,1,0.36,1) both',
        flicker: 'flicker 4s ease-in-out infinite',
        sweep: 'sweep 0.7s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
