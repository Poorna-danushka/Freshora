/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f5ee',
          100: '#c5e7d3',
          200: '#9fd8b6',
          300: '#74c898',
          400: '#52bc81',
          500: '#1a7a4a',
          600: '#157040',
          700: '#0f6035',
          800: '#09502a',
          900: '#03401f',
          950: '#01200f',
        },
        accent: {
          50:  '#fff4ed',
          100: '#ffe5cc',
          200: '#ffc999',
          300: '#ffa966',
          400: '#ff8c33',
          500: '#f97316',
          600: '#e05e05',
          700: '#c04c04',
          800: '#9e3b03',
          900: '#7d2a02',
        },
        surface: '#ffffff',
        background: '#f9fafb',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        'nav': '0 2px 12px rgba(0,0,0,0.08)',
        'modal': '0 24px 64px rgba(0,0,0,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
