import { invoiceService }  from "../services/invoiceService.js";
import { activityService } from "../services/activityService.js";
import { overdueService }  from "../services/overdueService.js";
import { successResponse } from "../lib/utils.js";

export const dashboardController = {
  async getStats(req, res) {
    await overdueService.runFullScan();
    const stats = await invoiceService.getStats(req.userId); // 👈
    return successResponse(res, stats);
  },

  async getChart(req, res) {
    const stats = await invoiceService.getStats(req.userId); // 👈
    const chart = [
      { status: "paid",    count: stats.paid    },
      { status: "pending", count: stats.pending },
      { status: "overdue", count: stats.overdue },
    ];
    return successResponse(res, { chart });
  },

  async getRecentActivity(req, res) {
    const activity = await activityService.getRecent(10, req.userId); // 👈
    return successResponse(res, { activity });
  },

  async getDashboard(req, res) {
    await overdueService.runFullScan();
    const [stats, activity] = await Promise.all([
      invoiceService.getStats(req.userId),       // 👈
      activityService.getRecent(10, req.userId), // 👈
    ]);
    const chart = [
      { status: "paid",    count: stats.paid    },
      { status: "pending", count: stats.pending },
      { status: "overdue", count: stats.overdue },
    ];
    return successResponse(res, { stats, chart, activity });
  },
};