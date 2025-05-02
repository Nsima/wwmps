/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Scan app and component files
  ],
  darkMode: 'class', // Enable class-based dark mode toggling
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        pastorBlue: '#1d4ed8', // Optional custom color
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'), // Custom scrollbar support
  ],
};
