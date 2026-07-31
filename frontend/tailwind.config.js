export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Samurai Academy Color Palette
        samurai: {
          parchment: "#FBF7EE",
          parchmentCard: "#FFFDF7",
          darkParchment: "#0D1117",
          darkCard: "#161C2A",
          indigo: "#1E1B4B",
          indigoLight: "#283358",
          crimson: "#B91C1C",
          crimsonHover: "#991B1B",
          gold: "#D4AF37",
          goldHover: "#B48F28",
          bamboo: "#15803D",
          sumi: "#1C1917"
        },
        // Legacy fallbacks mapped to Samurai theme
        ink: "#0D1117",
        panel: "#161C2A",
        panelSoft: "#1F283D",
        mint: "#D4AF37", // mapped mint to samurai gold
        line: "#2A354D"
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(212, 175, 55, 0.2)",
        samurai: "0 8px 30px rgba(0, 0, 0, 0.12)",
        samuraiGold: "0 0 20px rgba(212, 175, 55, 0.25)",
        samuraiCrimson: "0 0 20px rgba(185, 28, 28, 0.25)"
      }
    }
  },
  plugins: []
};
