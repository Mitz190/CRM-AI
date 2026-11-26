/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBFAF8',
        violet: { 50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 500: '#8B5CF6', 600: '#7C3AED', 700: '#6D28D9' },
        lavender: '#E9E4FA',
        mint: { 100: '#DDF5EC', 500: '#34B88A' },
        peach: { 100: '#FFE8DC', 500: '#F4906B' },
      },
      boxShadow: { card: '0 1px 3px rgba(60, 40, 120, 0.06), 0 8px 24px rgba(60, 40, 120, 0.06)' },
      borderRadius: { xl2: '1.25rem' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};