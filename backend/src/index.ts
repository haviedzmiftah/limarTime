import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { scheduleRouter } from "./routes/schedule.js";
import { adminSlotsRouter } from "./routes/adminSlots.js";
import { masterDataRouter } from "./routes/masterData.js";
import { solverRouter } from "./routes/solver.js";
import { teachersRouter } from "./routes/teachers.js";

const app = new Hono();

// Middleware CORS agar dapat diakses dari Frontend Next.js (port 3000 / custom port)
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "limarTime Standalone Backend API",
    framework: "Hono + Node.js",
    timestamp: new Date().toISOString(),
  });
});

// Route Mounts
app.route("/api/schedule", scheduleRouter);
app.route("/api/admin/schedule-slots", adminSlotsRouter);
app.route("/api/admin", masterDataRouter);
app.route("/api/solver", solverRouter);
app.route("/api/teachers", teachersRouter);

const PORT = Number(process.env.PORT) || 4000;

console.log(`🚀 limarTime Backend Server starting on port ${PORT}...`);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✅ Backend Server berjalan di http://localhost:${info.port}`);
  }
);

export default app;
