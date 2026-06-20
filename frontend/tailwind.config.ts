import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          highlight: '#2563eb',
          primary: '#1e293b',
          hover: '#0f172a',
          accent: '#3b82f6',
        },
        surface: {
          DEFAULT: '#f1f5f9',
          card: '#ffffff',
          border: '#cbd5e1',
          hover: '#e2e8f0',
          input: '#ffffff',
          sidebar: '#1e293b',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
          inverse: '#f8fafc',
        },
        accent: {
          blue: '#2563eb',
          cyan: '#0891b2',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1e40af 0%, #1e293b 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(37, 99, 235, 0.25)',
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.625rem',
      },
    },
  },
  plugins: [],
};

export default config;
