// server/src/routes/dashboard.js

import { Router } from "express";
import { asyncWrapper }    from "../middleware/asyncWrapper.js";
import { invoiceService }  from "../services/invoiceService.js";
import { activityService } from "../services/activityService.js";
import { overdueService }  from "../services/overdueService.js";
import { successResponse } from "../lib/utils.js";

const router = Router();

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/dashboard/stats
// Stat cards — total, paid, pending, overdue, unpaid amount, reminders sent
router.get(
  "/stats",
  asyncWrapper(async (req, res) => {
    // Run overdue scan before computing stats so numbers are fresh
    await overdueService.runFullScan();
    const stats = await invoiceService.getStats();
    return successResponse(res, stats);
  })
);

// GET /api/dashboard/chart
// Invoice status breakdown for pie / bar chart
router.get(
  "/chart",
  asyncWrapper(async (req, res) => {
    const stats = await invoiceService.getStats();

    const chart = [
      { status: "paid",    count: stats.paid    },
      { status: "pending", count: stats.pending },
      { status: "overdue", count: stats.overdue },
    ];

    return successResponse(res, { chart });
  })
);

// GET /api/dashboard/recent-activity
// Last 10 events for the dashboard feed
router.get(
  "/recent-activity",
  asyncWrapper(async (req, res) => {
    const activity = await activityService.getRecent(10);
    return successResponse(res, { activity });
  })
);

// GET /api/dashboard
// All dashboard data in one request — avoids three waterfalls on page load
router.get(
  "/",
  asyncWrapper(async (req, res) => {
    await overdueService.runFullScan();

    const [stats, activity] = await Promise.all([
      invoiceService.getStats(),
      activityService.getRecent(10),
    ]);

    const chart = [
      { status: "paid",    count: stats.paid    },
      { status: "pending", count: stats.pending },
      { status: "overdue", count: stats.overdue },
    ];

    return successResponse(res, { stats, chart, activity });
  })
);

export default router;