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
        primary: {
          50: '#FDE8DF',
          100: '#FCCEC0',
          200: '#F8A285',
          300: '#F5804D',
          400: '#F07A47',
          500: '#EA5E2B',
          600: '#D84E1F',
          700: '#C04418',
          800: '#A83A13',
          900: '#8B2E0D',
        },
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
