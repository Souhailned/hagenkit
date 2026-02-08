import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
} satisfies Config

export default config
