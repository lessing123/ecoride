/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D6A4F',
        secondary: '#74C69D',
        'primary-light': '#52B788',
        'primary-dark': '#1B4332',
        'eco-bg': '#F0F7F4',
        'eco-border': '#D1E7DD',
      },
    },
  },
  plugins: [],
};
