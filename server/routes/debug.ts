import { RequestHandler } from "express";

export const handleDebug: RequestHandler = (req, res) => {
  const debug = {
    supabaseUrl: process.env.SUPABASE_URL ? "SET" : "NOT SET",
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET",
    supabaseUrlValue: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + "..." : "undefined",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  res.json(debug);
};
