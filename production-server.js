import "dotenv/config";
import { createServer } from "./dist/server/index.js";
import path from "path";

const PORT = process.env.PORT || 8080;

// Start server
(async () => {
  const app = await createServer();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    console.log(
      `📁 Serving static files from: ${path.join(process.cwd(), "dist/spa")}`,
    );
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
    console.log(
      `📊 Supabase URL: ${process.env.SUPABASE_URL ? "Configured" : "Not configured"}`,
    );
    console.log(
      `🔑 Supabase Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Not configured"}`,
    );
  });
})();

export default async () => await createServer();
