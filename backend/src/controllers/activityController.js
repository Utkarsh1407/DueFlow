import { activityService } from "../services/activityService.js";
import { successResponse } from "../lib/utils.js";

export const activityController = {
  async getAll(req, res) {
    const limit  = Number(req.query.limit)  || 50;
    const offset = Number(req.query.offset) || 0;

    const { items, total } = await activityService.getAll({
      limit,
      offset,
      userId: req.userId, // 👈
    });

    return successResponse(res, {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });
  },

  async getByInvoice(req, res) {
    // Already scoped by invoiceId — no userId needed here
    const items = await activityService.getByInvoice(req.params.invoiceId);
    return successResponse(res, { items });
  },
};