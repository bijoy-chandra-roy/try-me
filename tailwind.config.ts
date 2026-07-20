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
          400: '#858a75',
          500: '#6b705c',
          600: '#565a4e',
          700: '#44473d',
          800: '#363932',
          900: '#2a2c26',
        },
        /* Semantic aliases → CSS vars (light/dark via :root / .dark) */
        body: 'var(--color-background-body)',
        surface: 'var(--color-background-surface)',
        card: 'var(--color-background-card)',
        popover: 'var(--color-background-popover)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        accent: 'var(--color-text-accent)',
        border: {
          DEFAULT: 'var(--color-border)',
          emphasized: 'var(--color-border-emphasized)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          muted: 'var(--color-success-muted)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          muted: 'var(--color-error-muted)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          muted: 'var(--color-warning-muted)',
        },
      },
      spacing: {
        'token-0': 'var(--spacing-0)',
        'token-1': 'var(--spacing-1)',
        'token-2': 'var(--spacing-2)',
        'token-3': 'var(--spacing-3)',
        'token-4': 'var(--spacing-4)',
        'token-5': 'var(--spacing-5)',
        'token-6': 'var(--spacing-6)',
        'token-8': 'var(--spacing-8)',
        'token-10': 'var(--spacing-10)',
        'token-12': 'var(--spacing-12)',
      },
      borderRadius: {
        inner: 'var(--radius-inner)',
        element: 'var(--radius-element)',
        container: 'var(--radius-container)',
        page: 'var(--radius-page)',
      },
      height: {
        'control-sm': 'var(--size-element-sm)',
        'control-md': 'var(--size-element-md)',
        'control-lg': 'var(--size-element-lg)',
      },
      minHeight: {
        'control-sm': 'var(--size-element-sm)',
        'control-md': 'var(--size-element-md)',
        'control-lg': 'var(--size-element-lg)',
      },
      maxWidth: {
        content: 'var(--layout-content-max)',
        form: 'var(--layout-form-max)',
        narrow: 'var(--layout-narrow-max)',
      },
      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
      boxShadow: {
        low: 'var(--shadow-low)',
        med: 'var(--shadow-med)',
        high: 'var(--shadow-high)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        medium: 'var(--duration-medium)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      backdropBlur: {
        glass: '20px',
        popover: '24px',
      },
    },
  },
  plugins: [],
};
