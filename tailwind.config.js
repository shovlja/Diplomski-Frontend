/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // default UI font
        sans: ['"Manrope Variable"', "Manrope", "system-ui", "ui-sans-serif", "Segoe UI", "Arial", "sans-serif"],
        // display za velike naslove
        display: ['"Plus Jakarta Sans Variable"', "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      keyframes: {
        // horizontal “breathing” gradient
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // dijagonalno (opciono)
        "gradient-xy": {
          "0%, 100%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
        },
      },
      animation: {
        gradient: "gradient 15s ease infinite",
        "gradient-fast": "gradient 8s ease-in-out infinite",
        "gradient-xy": "gradient-xy 18s ease infinite",
      },
    },
  },
  plugins: [],
};
