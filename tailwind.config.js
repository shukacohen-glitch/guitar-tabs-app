/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        guitar: {
          brown: '#8B4513',
          gold: '#DAA520',
          dark: '#1a0a00',
          string: '#C8A96E',
        },
      },
    },
  },
  plugins: [],
};
