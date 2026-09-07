/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#EDE5D0',
          dark: '#E0D7C0',
        },
        gold: {
          DEFAULT: '#D19E2C',
          light: '#E2B854',
          dark: '#B2821E',
        },
        navy: {
          DEFAULT: '#0B2048',
          light: '#16366E',
          dark: '#06132B',
        },
        emerald: {
          DEFAULT: '#008F6A',
          light: '#00AB80',
        },
        amber: {
          DEFAULT: '#E8822A',
          light: '#F8B060',
        },
        slate: {
          50: '#F2F0EA',
          100: '#E0DCD2',
          200: '#C4BEB0',
          300: '#A39B8A',
          400: '#4B536A',
          500: '#262D40',
          600: '#1A1F2E',
          700: '#141A28',
          800: '#0E121F',
          900: '#070A14',
        },
        success: '#008F6A',
        warning: '#E8822A',
        danger: '#D61A0A',
        'border-light': '#C4BEB0',
        'border-medium': '#A39B8A',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
        'fadeInUp': 'fadeInUp 0.4s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'slideOutRight': 'slideOutRight 0.3s ease-in',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scaleCheck': 'scaleCheck 0.2s ease-out',
        'pop': 'pop 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scaleCheck: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'elevated': 'var(--shadow-elevated)',
        'gold': '0 4px 14px var(--accent-glow)',
        'gold-hover': '0 8px 28px var(--accent-shadow-drag)',
      },
    },
  },
  plugins: [],
}
