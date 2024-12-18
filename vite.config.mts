import { defineConfig } from "npm:vite@^6";
import viteReact from "npm:@vitejs/plugin-react@^4.3.4";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "#/": "/src/",
    },
  },
  plugins: [viteReact()],
});
