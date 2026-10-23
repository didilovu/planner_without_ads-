import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["turtle.webp", "apple-touch-icon.png"],
      manifest: {
        name: "Little Turtle Planner",
        short_name: "Черепашка",
        lang: "ru",
        description: "Задачи и привычки — в своём темпе",
        theme_color: "#F8F3E8",
        background_color: "#F8F3E8",
        display: "standalone",
        start_url: "./",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webp,svg,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
});
