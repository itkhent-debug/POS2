/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        "2xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        xs: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      spacing: {
        "4.5": "1.125rem",
        "8.5": "2.125rem",
        "22": "5.5rem",
      },
      borderRadius: {
        xs: "0.125rem",
      },
    },
  },
  plugins: [],
};
