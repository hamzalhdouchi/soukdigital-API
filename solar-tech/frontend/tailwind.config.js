/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          active: '#134E4A',
          light: '#CCFBF1',
        },
        gold: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        dark: {
          DEFAULT: '#0A1628',
          surface: '#0F1F35',
        },
        success: '#22C55E',
        error: '#E11D48',
        warning: '#F59E0B',
        info: '#0EA5E9',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F1F5F9',
          offset: '#E2E8F0',
        },
        text: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          faint: '#94A3B8',
        },
      },
      backgroundColor: {
        base: '#F8FAFC',
      },
      borderColor: {
        DEFAULT: '#CBD5E1',
        divider: '#E2E8F0',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.875rem',
        xl: '1.25rem',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(15,23,42,0.06)',
        md: '0 4px 12px rgba(15,23,42,0.08)',
        lg: '0 12px 32px rgba(15,23,42,0.12)',
        'teal-glow': '0 0 28px rgba(15,118,110,0.4)',
        'teal-glow-sm': '0 0 14px rgba(15,118,110,0.25)',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'DM Sans', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.8rem, 6.5vw, 5rem)', { lineHeight: '1.02', fontWeight: '700', letterSpacing: '-0.025em' }],
        heading: ['clamp(1.6rem, 3vw, 2.4rem)', { lineHeight: '1.15', fontWeight: '600' }],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.5s ease both',
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
