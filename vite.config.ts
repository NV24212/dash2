import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),
    // Only include express plugin during development (serve command)
    ...(command === "serve" ? [expressPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      try {
        // Dynamically import the server only during development
        const { createServer } = await import("./server/index.js");
        const app = createServer();

        // Add Express app as middleware to Vite dev server
        server.middlewares.use(app);
      } catch (error) {
        console.warn("Failed to load server for development:", error);
      }
    },
  };
}
