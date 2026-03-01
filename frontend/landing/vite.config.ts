import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": "/shared/src",
      // Явно алиасируем React и Emotion, чтобы обеспечить единый экземпляр
      // Это помогает избежать проблем с "несколькими копиями React" в монорепозиториях.
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@emotion/react": path.resolve(__dirname, "node_modules/@emotion/react"),
      "@emotion/styled": path.resolve(
        __dirname,
        "node_modules/@emotion/styled",
      ),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
  optimizeDeps: {
    include: ["hoist-non-react-statics"],
  },
});
