/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F8F6F0',
        ink: '#121212',
        'signal-yellow': '#FFDE00',
        'sos-red': '#D32F2F',
        'transit-green': '#1B5E20',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'hard': '4px 4px 0px #121212',
        'hard-sm': '2px 2px 0px #121212',
        'hard-lg': '6px 6px 0px #121212',
      }
    },
  },
  plugins: [],
}
