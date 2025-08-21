import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "./routes/customers";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "./routes/products";
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
} from "./routes/orders";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "./routes/categories";
import {
  uploadMiddleware,
  handleImageUpload,
  handleMultipleImageUpload,
  deleteImage,
  getStorageInfo,
} from "./routes/upload";
import { trackEvent, getAnalytics, getRealTimeData } from "./routes/analytics";
import {
  getLogs,
  addLog,
  clearLogs,
  exportLogs,
  getSystemHealth,
  initializeLogs,
} from "./routes/logs";
import { handleFixCharacters } from "./routes/fix-characters";

export async function createServer(): Express {
  const app = express();
  await setupRoutes(app);
  return app;
}

// Export setupRoutes function for node-build.ts
export async function setupRoutes(app: Express) {
  // Note: CORS and body parsing middleware should be applied by the caller
  // (either node-build.ts or the Vite dev server)

  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Serve static files from React build (only in production)
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(process.cwd(), "dist/spa")));
  }

  // Example API routes
  app.get("/api/demo", handleDemo);

  // Upload routes
  app.get("/api/upload/info", getStorageInfo);
  app.post("/api/upload", uploadMiddleware, handleImageUpload);
  app.post("/api/upload/multiple", handleMultipleImageUpload);
  app.delete("/api/upload/:filename", deleteImage);

  // Customer routes
  app.get("/api/customers", getAllCustomers);
  app.get("/api/customers/:id", getCustomerById);
  app.post("/api/customers", createCustomer);
  app.put("/api/customers/:id", updateCustomer);
  app.delete("/api/customers/:id", deleteCustomer);

  // Product routes
  app.get("/api/products", getAllProducts);
  app.get("/api/products/:id", getProductById);
  app.post("/api/products", createProduct);
  app.put("/api/products/:id", updateProduct);
  app.delete("/api/products/:id", deleteProduct);

  // Order routes
  app.get("/api/orders", getAllOrders);
  app.get("/api/orders/:id", getOrderById);
  app.post("/api/orders", createOrder);
  app.put("/api/orders/:id", updateOrder);
  app.delete("/api/orders/:id", deleteOrder);

  // Category routes
  app.get("/api/categories", getAllCategories);
  app.get("/api/categories/:id", getCategoryById);
  app.post("/api/categories", createCategory);
  app.put("/api/categories/:id", updateCategory);
  app.delete("/api/categories/:id", deleteCategory);

  // Analytics routes
  app.post("/api/analytics/track", trackEvent);
  app.get("/api/analytics", getAnalytics);
  app.get("/api/analytics/realtime", getRealTimeData);

  // Logs routes
  app.get("/api/logs", getLogs);
  app.post("/api/logs", addLog);
  app.delete("/api/logs", clearLogs);
  app.get("/api/logs/export", exportLogs);
  app.get("/api/logs/health", getSystemHealth);

  // System maintenance routes
  app.post("/api/system/fix-characters", handleFixCharacters);

  // Admin routes
  const {
    handleAdminLogin,
    handleChangePassword,
    handleUpdateEmail,
    handleGetAdminInfo,
  } = await import("./routes/admin");

  app.post("/api/admin/login", handleAdminLogin);
  app.post("/api/admin/change-password", handleChangePassword);
  app.put("/api/admin/email", handleUpdateEmail);
  app.get("/api/admin/info", handleGetAdminInfo);

  // Initialize sample logs
  initializeLogs();

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "ping", timestamp: new Date().toISOString() });
  });

  // Catch-all handler: send back React's index.html file for any non-API routes (production only)
  if (process.env.NODE_ENV === "production") {
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/spa/index.html"));
    });
  }
}

// Note: Server startup is handled by production-server.js in production
// and by Vite dev server in development
