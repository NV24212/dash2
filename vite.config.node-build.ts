import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist/server",
    lib: {
      entry: path.resolve(__dirname, "server/node-build.ts"),
      formats: ["es"],
      fileName: "node-build",
    },
    rollupOptions: {
      external: [
        "express",
        "cors",
        "dotenv",
        "multer",
        "@supabase/supabase-js",
        "zod",
        "path",
        "fs",
        "crypto",
        /^node:/,
        "url",
      ],
      output: {
        format: "es",
      },
    },
    target: "node18",
    ssr: true,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
