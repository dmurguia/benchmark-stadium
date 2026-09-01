/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f1e8",
        panel: "#eee8de",
        hairline: "#d8d0c4",
        ink: "#272a24",
        muted: "#6f6a61",
        card: "#fbf8f2",
        forest: {
          DEFAULT: "#2f3a31",
          hover: "#455443",
        },
        rust: {
          DEFAULT: "#9b4e35",
          tint: "#f3e7e1",
        },
        moss: {
          tint: "#e6ede4",
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        whisper: "0 1px 2px rgba(39, 42, 36, 0.04)",
      },
      maxWidth: {
        content: "1080px",
      },
    },
  },
  plugins: [],
};
