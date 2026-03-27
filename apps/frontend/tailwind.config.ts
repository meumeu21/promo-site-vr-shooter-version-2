import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          soft: 'hsl(var(--surface-soft))'
        },
        panel: {
          DEFAULT: 'hsl(var(--panel))',
          foreground: 'hsl(var(--panel-foreground))'
        },
        brand: {
          start: '#601F8C',
          end: '#1D04BF'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['Feature Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Feature Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      backgroundImage: {
        'brand-panel': 'linear-gradient(135deg, rgba(96, 31, 140, 0.22), rgba(29, 4, 191, 0.32))'
      },
      boxShadow: {
        neon: '0 0 0.75rem rgba(13, 166, 166, 0.28)'
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        'super-wide': '0.2em',
        cyber: '0.3em'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
export default config;
