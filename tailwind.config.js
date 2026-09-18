/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2559',
          dark: '#12193F',
        },
        cream: '#FDF3E7',
        blush: '#FBE7E4',
        coral: {
          DEFAULT: '#F0653E',
          dark: '#D6512D',
        },
        forest: '#1F4D3A',
        sand: '#F6E4CE',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
};
