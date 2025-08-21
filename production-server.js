import "dotenv/config";
import { createServer } from "./dist/server/index.js";

const app = createServer();
const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Not configured'}`);
});

export default app;
