import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  server: {
    proxy: {
      // Preserve the backend's same-origin contract during local development.
      // Frontend source directories must not use `api` as a name because Vite
      // transforms their module URLs under the same reserved URL prefix.
      "/api": {
        target: "http://localhost:8000",
      },
    },
  },
  test: {
    environment: "jsdom",
  },
});
