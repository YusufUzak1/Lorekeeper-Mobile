/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mythos: {
          bg: '#0F0F11',
          panel: '#1A1A1D',
          dark: '#141416',
          accent: '#C6A052',
          text: '#E5E5E5',
          muted: '#8A8A8E',
          border: '#2A2A2E'
        }
      }
    },
  },
  plugins: [],
}
