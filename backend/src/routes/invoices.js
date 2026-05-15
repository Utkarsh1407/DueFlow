// server/src/routes/invoices.js

import { Router } from "express";
import { z }      from "zod";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { validate }     from "../middleware/validate.js";
import { invoiceService } from "../services/invoiceService.js";
import { reminderService } from "../services/reminderService.js";
import { successResponse } from "../lib/utils.js";

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const createInvoiceSchema = z.object({
  clientName:  z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email address"),
  amount:      z.coerce.number().positive("Amount must be greater than 0"),
  dueDate:     z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid due date",
  }),
  notes: z.string().max(500).optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
});

const querySchema = z.object({
  status:  z.enum(["ALL", "PENDING", "PAID", "OVERDUE"]).optional(),
  search:  z.string().optional(),
  sortBy:  z.enum(["amount", "dueDate", "createdAt", "clientName"]).optional(),
  order:   z.enum(["asc", "desc"]).optional(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

// GET  /api/invoices
router.get(
  "/",
  validate(querySchema, "query"),
  asyncWrapper(async (req, res) => {
    const invoices = await invoiceService.getAll(req.query);
    return successResponse(res, { invoices });
  })
);

// GET  /api/invoices/:id
router.get(
  "/:id",
  asyncWrapper(async (req, res) => {
    const invoice = await invoiceService.getById(req.params.id);
    return successResponse(res, { invoice });
  })
);

// POST /api/invoices
router.post(
  "/",
  validate(createInvoiceSchema),
  asyncWrapper(async (req, res) => {
    const invoice = await invoiceService.create(req.body);
    return successResponse(res, { invoice }, 201);
  })
);

// PATCH /api/invoices/:id
router.patch(
  "/:id",
  validate(updateInvoiceSchema),
  asyncWrapper(async (req, res) => {
    const invoice = await invoiceService.update(req.params.id, req.body);
    return successResponse(res, { invoice });
  })
);

// PATCH /api/invoices/:id/pay  — quick mark-as-paid shortcut
router.patch(
  "/:id/pay",
  asyncWrapper(async (req, res) => {
    const invoice = await invoiceService.markPaid(req.params.id);
    return successResponse(res, { invoice });
  })
);

// DELETE /api/invoices/:id
router.delete(
  "/:id",
  asyncWrapper(async (req, res) => {
    const result = await invoiceService.delete(req.params.id);
    return successResponse(res, result);
  })
);

// GET  /api/invoices/:id/reminders  — reminder history for one invoice
router.get(
  "/:id/reminders",
  asyncWrapper(async (req, res) => {
    const reminders = await reminderService.getHistory(req.params.id);
    return successResponse(res, { reminders });
  })
);

// GET  /api/invoices/:id/reminders/status  — cooldown status
router.get(
  "/:id/reminders/status",
  asyncWrapper(async (req, res) => {
    const status = await reminderService.getCooldownStatus(req.params.id);
    return successResponse(res, status);
  })
);

export default router;