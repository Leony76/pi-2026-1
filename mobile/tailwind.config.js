/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [
    require("nativewind/preset")
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito-Regular"],
        "nunito-bold": ["Nunito-Bold"],
      },
      colors: {
        medroom: {
          primary: "var(--medroom-primary-color)",
          secondary: "var(--medroom-secondary-color)",
        },
      },
    },
  },
  plugins: [],
};