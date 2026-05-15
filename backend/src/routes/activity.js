// server/src/routes/activity.js

import { Router } from "express";
import { z }      from "zod";
import { asyncWrapper }    from "../middleware/asyncWrapper.js";
import { validate }        from "../middleware/validate.js";
import { activityService } from "../services/activityService.js";
import { successResponse } from "../lib/utils.js";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const paginationSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/activity
// Global activity feed with pagination
// server/src/routes/activity.js
router.get(
  "/",
  validate(paginationSchema, "query"),
  asyncWrapper(async (req, res) => {
    const limit  = Number(req.query.limit)  || 50;  // ✅ coerce to int
    const offset = Number(req.query.offset) || 0;

    const { items, total } = await activityService.getAll({ limit, offset });
    return successResponse(res, {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    });
  })
);

// GET /api/activity/:invoiceId
// Activity timeline for a specific invoice
router.get(
  "/:invoiceId",
  asyncWrapper(async (req, res) => {
    const items = await activityService.getByInvoice(req.params.invoiceId);
    return successResponse(res, { items });
  })
);

export default router;