/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "chungbuk-purple": "#724598",
        "chungbuk-cyan": "#00AEBB",
        "chungbuk-dark-blue": "#001655",
      },
    },
  },
  plugins: [],
};
