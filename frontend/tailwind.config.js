/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA'
        }
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};
