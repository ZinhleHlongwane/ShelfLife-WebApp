import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.SHELFLIFE_API_PROXY ?? "http://localhost:5000",
        changeOrigin: true,
      },
      "/health": {
        target: process.env.SHELFLIFE_API_PROXY ?? "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
