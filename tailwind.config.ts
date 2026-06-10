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
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          DEFAULT: "#F5E6CC",
          dark: "#E5D2B3",
          light: "#FAF3E8",
        },
        obsidian: {
          DEFAULT: "#111111",
          light: "#222222",
          dark: "#050505",
        },
        purpleBrand: {
          DEFAULT: "#5B3A8E",
          hover: "#4A2F75",
          light: "#F0EBF7",
        },
        greenBrand: {
          DEFAULT: "#1E3A34",
          hover: "#152924",
          light: "#E4EDE9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
