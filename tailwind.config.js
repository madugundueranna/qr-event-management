// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f0ff",
          100: "#ede4ff",
          200: "#bfdbfe",
          300: "#93c5fd",
          500: "#6d35f5",
          600: "#5c2bd6",
          700: "#4b22b4",
        },
        gold: {
          50: "#fff8e8",
          100: "#f8e8bd",
          500: "#b57a16",
          600: "#9b660f",
          700: "#7b500b",
        },
        ink: {
          900: "#070b1f",
          800: "#12172f",
          700: "#252b45",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        card: "0 12px 40px rgba(15, 23, 42, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
