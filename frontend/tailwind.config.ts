import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#E8577A",
          light: "#FFF0F3",
          muted: "#F7C5D0",
        },
        lavender: "#9B8FD9",
        sage: "#5DBE9F",
        amber: "#E8A44A",
        graphite: "#1E1523",
        muted: "#7A6B7E",
        surface: "#FFFFFF",
        bg: "#FAF7F8",
        border: "#EDE8EB",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Fira Code", "monospace"],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.1", letterSpacing: "0" }],
        title: ["1.5rem", { lineHeight: "1.25", letterSpacing: "0" }],
        heading: ["1.125rem", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0" }],
        body: ["0.9375rem", { lineHeight: "1.6", letterSpacing: "0" }],
        label: ["0.8125rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0" }],
        mono: ["0.8125rem", { lineHeight: "1.6", letterSpacing: "0" }],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
        input: "8px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(30,21,35,0.06), 0 0 0 1px #EDE8EB",
        elevated: "0 4px 16px rgba(30,21,35,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
