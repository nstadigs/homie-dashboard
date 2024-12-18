import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "#/": "/src/",
    },
  },
  plugins: [
    deno(),
    // @ts-expect-error - Types are wrong
    react(),
  ],
});
