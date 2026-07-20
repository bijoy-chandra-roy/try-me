/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-urbanist)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      colors: {
        sand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e8e0d4',
          300: '#d4c8b8',
          400: '#b8a690',
          500: '#9a8570',
          600: '#7d6a58',
          700: '#655546',
          800: '#524538',
          900: '#443a30',
        },
        clay: {
          400: '#c4a484',
          500: '#a8866a',
          600: '#8b6f56',
        },
        olive: {
          500: '#6b705c',
          600: '#565a4e',
          700: '#44473d',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
