/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#101019",
          800: "#181825",
          700: "#232336",
          600: "#33334d",
          400: "#7c7c9a",
          200: "#c9c9dd",
          50: "#f2f2f8",
        },
        arena: {
          DEFAULT: "#7c5cff",
          bright: "#9d85ff",
          dim: "#5a3fd6",
        },
        gold: "#f5b83d",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "'Segoe UI'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
