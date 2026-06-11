/** @type {import('tailwindcss').Config} */
export default {
  // class-based dark mode: toggled by adding/removing "dark" on <html>
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        // Override Tailwind's serif stack with DM Serif Display
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        // Override sans with DM Sans
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        // Teal accent shades are already in Tailwind core,
        // but we can add a custom "journal" palette here if needed later.
      },
      borderWidth: {
        3: "3px",
      },
      animation: {
        "slide-up": "slide-up 0.2s ease forwards",
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [],
};