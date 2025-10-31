/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme with neon green accents
        neon: {
          50: "#f0ffe8",
          100: "#dcffc7",
          200: "#beff94",
          300: "#95ff56",
          400: "#6fff21",
          500: "#39ff14", // Primary neon green
          600: "#2ed60f",
          700: "#24a80b",
          800: "#1d8309",
          900: "#166607",
        },
        dark: {
          50: "#4a4a4a",
          100: "#3a3a3a",
          200: "#2a2a2a",
          300: "#1f1f1f",
          400: "#1a1a1a",
          500: "#141414", // Primary dark background
          600: "#0f0f0f",
          700: "#0a0a0a",
          800: "#050505",
          900: "#000000", // Pure black
        },
        accent: {
          cyan: "#00fff0",
          purple: "#b026ff",
          pink: "#ff10f0",
          yellow: "#ffed4e",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#39ff14",
          600: "#2ed60f",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ff4444",
          600: "#dd2222",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#ffed4e",
          600: "#e8d845",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.5)",
        card: "0 4px 20px 0 rgba(57, 255, 20, 0.15)",
        elevated: "0 10px 40px 0 rgba(57, 255, 20, 0.25)",
        neon: "0 0 20px rgba(57, 255, 20, 0.6), 0 0 40px rgba(57, 255, 20, 0.3)",
        "neon-sm": "0 0 10px rgba(57, 255, 20, 0.5)",
        "neon-lg": "0 0 30px rgba(57, 255, 20, 0.7), 0 0 60px rgba(57, 255, 20, 0.4)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(57, 255, 20, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(57, 255, 20, 0.8)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
