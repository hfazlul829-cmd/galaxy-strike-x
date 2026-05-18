import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body:    ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      colors: {
        "neon-cyan":     "#00ffff",
        "neon-purple":   "#aa00ff",
        "neon-green":    "#00ff88",
        "neon-red":      "#ff3366",
        "neon-gold":     "#ffd700",
        "space-black":   "#02040a",
        "space-dark":    "#040810",
        "panel":         "rgba(4, 12, 28, 0.88)",
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        primary:   { DEFAULT: "#00ffff", foreground: "#000810" },
        secondary: { DEFAULT: "#aa00ff", foreground: "#e8f0ff" },
        accent:    { DEFAULT: "#00ff88", foreground: "#000810" },
        destructive: { DEFAULT: "#ff3366", foreground: "#e8f0ff" },
        muted:     { DEFAULT: "rgba(0, 20, 40, 0.6)", foreground: "rgba(180,210,240,0.55)" },
        card:      { DEFAULT: "rgba(4, 12, 28, 0.88)", foreground: "#e8f0ff" },
        border:    "rgba(0, 255, 255, 0.12)",
        input:     "rgba(0, 255, 255, 0.08)",
        ring:      "#00ffff",
      },
      boxShadow: {
        "neon-cyan":   "0 0 12px rgba(0,255,255,0.6), 0 0 30px rgba(0,255,255,0.2)",
        "neon-purple": "0 0 12px rgba(170,0,255,0.6), 0 0 30px rgba(170,0,255,0.2)",
        "neon-green":  "0 0 12px rgba(0,255,136,0.6), 0 0 30px rgba(0,255,136,0.2)",
        "neon-red":    "0 0 12px rgba(255,51,102,0.6), 0 0 30px rgba(255,51,102,0.2)",
        "neon-gold":   "0 0 10px rgba(255,215,0,0.5)",
        "subtle":      "0 1px 3px rgba(0,0,0,0.6)",
        "panel":       "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 8px rgba(0,255,255,0.4), 0 0 20px rgba(0,255,255,0.1)" },
          "50%":     { boxShadow: "0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,255,255,0.3)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.85" },
        },
        "slide-up": {
          from: { transform: "translateY(32px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-32px)", opacity: "0" },
          to:   { transform: "translateY(0)",      opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.88)", opacity: "0" },
          to:   { transform: "scale(1)",    opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
        "flicker":     "flicker 0.15s infinite",
        "slide-up":    "slide-up 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
        "slide-down":  "slide-down 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
        "scale-in":    "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
        "spin-slow":   "spin-slow 8s linear infinite",
      },
      borderRadius: { lg: "0.5rem", md: "0.375rem", sm: "0.25rem" },
    },
  },
  plugins: [typography, containerQueries, animate],
};
