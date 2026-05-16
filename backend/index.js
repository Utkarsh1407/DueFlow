import "dotenv/config";
import express from "express";
import cors    from "cors";

import { clerkMiddlewareHandler, requireAuth } from "./src/middleware/requireAuth.js";
import { errorHandler }   from "./src/middleware/errorHandler.js";
import invoiceRoutes      from "./src/routes/invoices.js";
import reminderRoutes     from "./src/routes/reminders.js";
import dashboardRoutes    from "./src/routes/dashboard.js";
import activityRoutes     from "./src/routes/activity.js";
import { overdueService } from "./src/services/overdueService.js";

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin:      process.env.CLIENT_URL ?? "https://due-flow-zeta.vercel.app",
  credentials: true,
}));
app.use(express.json());

// Clerk JWT verification on every request
app.use(clerkMiddlewareHandler);

// Health check — public, no auth needed
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// All API routes are protected
app.use("/api/invoices",  requireAuth, invoiceRoutes);
app.use("/api/reminders", requireAuth, reminderRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/activity",  requireAuth, activityRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`🚀 DueFlow server running on http://localhost:${PORT}`);
  await overdueService.runFullScan().catch(console.error);
});