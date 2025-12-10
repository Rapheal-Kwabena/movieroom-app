/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./Src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'black-night': '#0F0F0F',
        'slate-grey': '#1E1E1E',
        'ash-silver': '#C4C4C4',
        'golden-accent': '#E6B10E',
        'pop-red': '#ED2B2A',
      },
      fontFamily: {
        header: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}