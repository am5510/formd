import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        outline: "#7e7373",
        "outline-variant": "#d8cccc",
        "inverse-surface": "#341d20",
        "inverse-on-surface": "#ffebec",
        background: "#fbf6f6",
        "on-background": "#291316",
        surface: "#fbf6f6",
        "on-surface": "#291316",
        "surface-variant": "#f4dcdd",
        "on-surface-variant": "#524344",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fef2f2",
        "surface-container": "#fde8e8",
        "surface-container-high": "#fadcdc",
        "surface-container-highest": "#f6d0d1",
        "surface-dim": "#eed0d0",
        "surface-bright": "#fbf6f6",
        "surface-tint": "#881320",
        primary: {
          DEFAULT: "#7a121d",
          container: "#991b1b",
          "on-container": "#ffdad6",
          fixed: "#ffdad6",
          "fixed-dim": "#ffb3ad",
        },
        "on-primary": "#ffffff",
        secondary: {
          DEFAULT: "#b91c1c",
          container: "#dc2626",
          "on-container": "#ffffff",
          fixed: "#fee2e2",
          "fixed-dim": "#fca5a5",
        },
        "on-secondary": "#ffffff",
        tertiary: {
          DEFAULT: "#4a1c1d",
          container: "#5f2526",
          "on-container": "#ffdad9",
          fixed: "#ffdad9",
          "fixed-dim": "#f5b7b6",
        },
        "on-tertiary": "#ffffff",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        "on-error": "#ffffff",
        likert: {
          5: "#0D9488",
          4: "#16A34A",
          3: "#D97706",
          2: "#EA580C",
          1: "#DC2626",
        },
      },
      fontFamily: {
        sans: [
          '"GoogleSansLatin"',
          '"NotoSansThaiPure"',
          '"Google Sans"',
          '"Noto Sans Thai"',
          "sans-serif",
        ],
        googlesans: [
          '"GoogleSansLatin"',
          '"Google Sans"',
          "sans-serif",
        ],
        thai: ['"NotoSansThaiPure"', '"Noto Sans Thai"', "sans-serif"],
      },
      spacing: {
        margin: "2rem",
        "margin-mobile": "1rem",
        gutter: "1.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
