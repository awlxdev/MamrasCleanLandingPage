import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  css: {
    postcss: {
      plugins: []
    }
  },

  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,

    allowedHosts: [
      "killing-romance-less-hunt.trycloudflare.com"
    ],

    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/storage": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      }
    }
  }
});

