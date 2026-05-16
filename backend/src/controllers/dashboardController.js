import { invoiceService }  from "../services/invoiceService.js";
import { activityService } from "../services/activityService.js";
import { overdueService }  from "../services/overdueService.js";
import { successResponse } from "../lib/utils.js";

export const dashboardController = {

  async getStats(req, res) {
    await overdueService.runFullScan();
    const stats = await invoiceService.getStats();
    return successResponse(res, stats);
  },

  async getChart(req, res) {
    const stats = await invoiceService.getStats();
    const chart = [
      { status: "paid",    count: stats.paid    },
      { status: "pending", count: stats.pending },
      { status: "overdue", count: stats.overdue },
    ];
    return successResponse(res, { chart });
  },

  async getRecentActivity(req, res) {
    const activity = await activityService.getRecent(10);
    return successResponse(res, { activity });
  },

  async getDashboard(req, res) {
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
  },
};