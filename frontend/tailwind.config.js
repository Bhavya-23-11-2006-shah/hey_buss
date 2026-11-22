/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        paper:   '#FFFFFF',
        surface: '#F5F7FC',
        // Text
        ink:     '#0B1330',
        muted:   '#4B5563',
        // Brand
        cobalt:  { DEFAULT: '#1238C9', dark: '#0B2488' },
        marigold:{ DEFAULT: '#FFB800', light: '#FFF3CC' },
        // Semantic
        success: { DEFAULT: '#00A86B', light: '#E6F7F1' },
        warning: { DEFAULT: '#FF7A1A', light: '#FFF0E6' },
        danger:  { DEFAULT: '#E5213B', light: '#FCE8EB' },
        // High-contrast theme overrides (applied via data-theme)
        hc: {
          bg:   '#000000',
          text: '#FFFFFF',
          accent:'#FFFF00',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'Inter', 'system-ui', 'Verdana', 'sans-serif'],
        mono: ['"Atkinson Hyperlegible"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        'body':  ['1rem',    { lineHeight: '1.7' }],  // 18px root → 1rem
        'lead':  ['1.125rem',{ lineHeight: '1.7' }],
        'h3':    ['1.333rem',{ lineHeight: '1.3', fontWeight: '700' }],
        'h2':    ['1.778rem',{ lineHeight: '1.25', fontWeight: '700' }],
        'h1-mob':['2rem',    { lineHeight: '1.15', fontWeight: '900' }],
        'h1':    ['3.111rem',{ lineHeight: '1.1',  fontWeight: '900' }],
      },
      spacing: {
        'tap': '3rem',   // 48px min tap target
        'tap-lg': '3.5rem', // 56px primary buttons
      },
      borderRadius: {
        card: '0.667rem', // 12px
        btn:  '0.5rem',   // 8px
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)',
        'card-md': '0 4px 12px 0 rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.06)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.08)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        busGlide: {
          '0%':   { transform: 'translateX(-5%)' },
          '50%':  { transform: 'translateX(85%)' },
          '100%': { transform: 'translateX(-5%)' },
        },
        ticketIn: {
          '0%':   { transform: 'translateY(-8px) scaleY(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0)   scaleY(1)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        alertFlash: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%':      { backgroundColor: 'rgba(229,33,59,0.2)' },
        },
        sosPing: {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        countdown: {
          from: { strokeDashoffset: '0' },
          to:   { strokeDashoffset: '100' },
        },
      },
      animation: {
        marquee:    'marquee 20s linear infinite',
        'bus-glide':'busGlide 12s ease-in-out infinite',
        'ticket-in':'ticketIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-in':  'fadeIn 0.2s ease-out forwards',
        shimmer:    'shimmer 1.6s linear infinite',
        'alert-flash':'alertFlash 0.5s ease-in-out 3',
        'sos-ping': 'sosPing 1s ease-out infinite',
      },
    },
  },
  plugins: [],
}
