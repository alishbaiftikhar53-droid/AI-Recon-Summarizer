/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#060A13',
          900: '#0A1120',
          850: '#0E1628',
          800: '#131D33',
          700: '#1E2A45',
          600: '#2A3A5E',
          500: '#4A5C80',
          400: '#6E7FA3',
          300: '#9AA8C4',
          200: '#C5CEE0',
          100: '#E4E9F3',
        },
        electric: {
          300: '#8EB8FF',
          400: '#5C9BFF',
          500: '#2F7BFF',
          600: '#1E63E6',
        },
        violet: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 320ms ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
