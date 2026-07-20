/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0E11",
          900: "#12161A",
          800: "#1B2127",
          700: "#262E36",
        },
        paper: "#EDEAE3",
        slate: {
          400: "#8A93A0",
          500: "#5B6470",
        },
        amber: {
          400: "#F5A623",
          500: "#E0941A",
        },
        cyan: {
          400: "#3FD9C7",
        },
        rose: {
          500: "#E5484D",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

