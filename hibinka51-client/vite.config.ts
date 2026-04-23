/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()], // Только React, без плагинов Storybook
  resolve: {
    alias: {
      "@shared": path.resolve(dirname, "./src/shared"),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  // Оставляем базовый конфиг тестов, если захочешь писать простые Unit-тесты
  test: {
    globals: true,
    environment: "jsdom",
  },
});
