// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",

    // Required when accessing Vite through a Cloudflare trycloudflare.com URL
    //allowedHosts: [".trycloudflare.com"],
    allowedHosts: ["workorbit.space"],

    proxy: {
      // Forward all /v1 API requests to FastAPI
      "/v1": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },

      // Forward the FastAPI root endpoint as well
      "/api-root": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,

        // /api-root → /
        rewrite: () => "/",
      },
    },
  },
});