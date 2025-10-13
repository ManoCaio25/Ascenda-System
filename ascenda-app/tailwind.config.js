/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#dbe4ff',
          200: '#b6c8ff',
          300: '#90acff',
          400: '#6a90ff',
          500: '#4574ff',
          600: '#345ad1',
          700: '#2644a1',
          800: '#1a2e71',
          900: '#0d1841'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(69, 116, 255, 0.35)'
      }
    }
  },
  plugins: []
};
