/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#EEF0FE",
        },
        canvas: "#F1F1F4",
        line: "#EBEBEB",
        ink: "#111111",
      },
      boxShadow: {
        panel: "0 1px 3px rgba(17,17,17,.04)",
        modal: "0 24px 60px -12px rgba(17,17,17,.35)",
        pop: "0 10px 30px -6px rgba(17,17,17,.16)",
      },
    },
  },
  plugins: [],
};
