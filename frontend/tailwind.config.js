export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1111",
        panel: "#162021",
        panelSoft: "#1d2a2c",
        mint: "#3ed0b8",
        line: "#24474a"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(62, 208, 184, 0.14)"
      }
    }
  },
  plugins: []
};
