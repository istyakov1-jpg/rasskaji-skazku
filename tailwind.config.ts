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
        fairy: {
          cream: '#FFF8F0',
          purple: {
            50: '#F3EEFF',
            100: '#E9DEFF',
            200: '#D4BFFF',
            300: '#B99AF5',
            400: '#9B7BE8',
            500: '#7C5CBF',
            600: '#5E3F99',
            700: '#432B73',
          },
          gold: {
            100: '#FFF3CC',
            300: '#FFD966',
            500: '#F9C74F',
            700: '#E6A817',
          },
          pink: {
            100: '#FFE8F0',
            300: '#FFB3CF',
            500: '#FF7FAB',
          },
          mint: {
            100: '#E0FFF5',
            300: '#A8EDCE',
            500: '#52C99A',
          },
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
      },
      backgroundImage: {
        'fairy-gradient': 'linear-gradient(135deg, #FFF8F0 0%, #F3EEFF 50%, #FFE8F0 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #FFF8F0 100%)',
        'magic-gradient': 'linear-gradient(135deg, #7C5CBF 0%, #FF7FAB 100%)',
      },
      boxShadow: {
        'fairy': '0 4px 24px -4px rgba(124, 92, 191, 0.15)',
        'fairy-lg': '0 8px 40px -8px rgba(124, 92, 191, 0.25)',
        'gold': '0 4px 24px -4px rgba(249, 199, 79, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
