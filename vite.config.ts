import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({}), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@classes": path.resolve(__dirname, "./src/classes"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
