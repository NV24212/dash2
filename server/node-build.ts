import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import all route handlers
import { setupRoutes } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const app = express();
  const PORT = Number(process.env.PORT) || 8080;

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Setup all API routes
  await setupRoutes(app);

  // Health check endpoint (required for Fly.io)
  app.get("/api/ping", (req, res) => {
    res.json({
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Serve static files from dist/spa
  app.use(express.static(path.join(__dirname, "../dist/spa")));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../dist/spa/index.html"));
    } else {
      res.status(404).json({ error: "API endpoint not found" });
    }
  });

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(
      `📁 Serving static files from: ${path.join(__dirname, "../dist/spa")}`,
    );
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();

export default {};
