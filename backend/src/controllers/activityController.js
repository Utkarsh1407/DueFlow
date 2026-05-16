import { activityService } from "../services/activityService.js";
import { successResponse } from "../lib/utils.js";
import { z } from "zod";

export const paginationSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const activityController = {

  async getAll(req, res) {
    const limit  = Number(req.query.limit)  || 50;
    const offset = Number(req.query.offset) || 0;

    const { items, total } = await activityService.getAll({ limit, offset });
    return successResponse(res, {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });
  },

  async getByInvoice(req, res) {
    const { invoiceId } = req.params;
    const items = await activityService.getByInvoice(invoiceId);
    return successResponse(res, { items });
  },

};