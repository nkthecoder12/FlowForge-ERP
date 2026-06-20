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
          highlight: '#DD88CF', // Highlights, KPIs, Progress
          primary: '#4B164C',   // Text, Buttons, Primary Actions
          hover: '#3A103B',     // Darker shade for button hover
        },
        surface: {
          DEFAULT: '#F5F5F5',   // Background
          card: '#F8E7F6',      // Cards/Surfaces
          border: '#E8C8E5',
          hover: '#F0D5ED',
          input: '#FFFFFF',
        },
        text: {
          primary: '#4B164C',
          secondary: '#754176',
          muted: '#9A669B',
        },
        accent: {
          purple: '#DD88CF',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #DD88CF 0%, #4B164C 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(221, 136, 207, 0.4)',
        'glow-sm': '0 0 10px rgba(221, 136, 207, 0.2)',
        card: '0 4px 24px rgba(75, 22, 76, 0.06)',
        'card-hover': '0 8px 40px rgba(75, 22, 76, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
