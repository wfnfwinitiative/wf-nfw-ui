/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ngo-orange': '#FF6B35',
        'ngo-green': '#4CAF50',
        'ngo-light': '#F8F9FA',
        'ngo-gray': '#6C757D',
        'ngo-dark': '#2C3E50'
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
