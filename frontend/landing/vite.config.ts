import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared/src"),

      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "../node_modules/react/jsx-runtime",
      ),
      "@mui/material": path.resolve(__dirname, "../node_modules/@mui/material"),
      "@emotion/react": path.resolve(
        __dirname,
        "../node_modules/@emotion/react",
      ),
      "@emotion/styled": path.resolve(
        __dirname,
        "../node_modules/@emotion/styled",
      ),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
