// server/src/routes/reminders.js

import { Router } from "express";
import { asyncWrapper }    from "../middleware/asyncWrapper.js";
import { reminderService } from "../services/reminderService.js";
import { successResponse } from "../lib/utils.js";
import  prisma        from "../lib/prisma.js";        // adjust path as needed
import { emailService } from "../services/emailService.js";

const router = Router();

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/reminders/:invoiceId/send
// Trigger a payment reminder email for an invoice
router.post("/:id/send", async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    await emailService.sendReminderEmail({
      clientName:  invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount:      invoice.amount,
      dueDate:     invoice.dueDate,
      invoiceId:   invoice.id,       // ← remap id → invoiceId
    });

    // ...
  } catch (err) {
    console.error("REMINDER ERROR:", err);       // ← add this if missing
    res.status(502).json({                       // ← return 502, don't let it unhandled-throw
      error: "Email service unavailable",
      detail: err.message,
    });
  }
});

// GET  /api/reminders/:invoiceId/history
// Full reminder history for one invoice
router.get(
  "/:invoiceId/history",
  asyncWrapper(async (req, res) => {
    const reminders = await reminderService.getHistory(req.params.invoiceId);
    return successResponse(res, { reminders });
  })
);

// GET  /api/reminders/:invoiceId/cooldown
// Check whether a reminder can be sent right now
router.get(
  "/:invoiceId/cooldown",
  asyncWrapper(async (req, res) => {
    const status = await reminderService.getCooldownStatus(req.params.invoiceId);
    return successResponse(res, status);
  })
);

export default router;