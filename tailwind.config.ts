import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,md,mdx}',
    './content/**/*.{md,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        md: {
          primary: 'var(--md-primary)',
          'on-primary': 'var(--md-on-primary)',
          'primary-container': 'var(--md-primary-container)',
          'on-primary-container': 'var(--md-on-primary-container)',
          secondary: 'var(--md-secondary)',
          'on-secondary': 'var(--md-on-secondary)',
          'secondary-container': 'var(--md-secondary-container)',
          'on-secondary-container': 'var(--md-on-secondary-container)',
          tertiary: 'var(--md-tertiary)',
          'on-tertiary': 'var(--md-on-tertiary)',
          'tertiary-container': 'var(--md-tertiary-container)',
          'on-tertiary-container': 'var(--md-on-tertiary-container)',
          background: 'var(--md-background)',
          'on-background': 'var(--md-on-background)',
          surface: 'var(--md-surface)',
          'on-surface': 'var(--md-on-surface)',
          'on-surface-variant': 'var(--md-on-surface-variant)',
          'surface-container-lowest': 'var(--md-surface-container-lowest)',
          'surface-container-low': 'var(--md-surface-container-low)',
          'surface-container': 'var(--md-surface-container)',
          'surface-container-high': 'var(--md-surface-container-high)',
          'surface-container-highest': 'var(--md-surface-container-highest)',
          outline: 'var(--md-outline)',
          'outline-variant': 'var(--md-outline-variant)',
          error: 'var(--md-error)',
          'on-error': 'var(--md-on-error)',
          'error-container': 'var(--md-error-container)',
          'on-error-container': 'var(--md-on-error-container)',
        },
      },
      borderRadius: {
        'md-xs': 'var(--md-shape-xs)',
        'md-sm': 'var(--md-shape-sm)',
        'md-md': 'var(--md-shape-md)',
        'md-lg': 'var(--md-shape-lg)',
        'md-xl': 'var(--md-shape-xl)',
        'md-full': 'var(--md-shape-full)',
      },
      boxShadow: {
        'md-1': 'var(--md-elev-1)',
        'md-2': 'var(--md-elev-2)',
        'md-3': 'var(--md-elev-3)',
      },
      fontFamily: {
        sans: [
          'Google Sans Text',
          'Roboto Flex',
          'Roboto',
          'system-ui',
          'ui-sans-serif',
          'sans-serif',
        ],
        display: [
          'Google Sans Display',
          'Google Sans',
          'Roboto Flex',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'Roboto Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
