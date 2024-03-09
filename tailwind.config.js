/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}"
  ],
  darkMode: ["media"], // media
  theme: {
    extend: {

    },
  },
  plugins: [require('@tailwindcss/forms')],
}

