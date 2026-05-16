import prisma              from "../lib/prisma.js";
import { emailService }    from "../services/emailService.js";
import { reminderService } from "../services/reminderService.js";
import { successResponse } from "../lib/utils.js";
import { canSendReminder, cooldownHoursRemaining } from "../lib/utils.js";

export const reminderController = {

  async send(req, res) {
    const { invoiceId } = req.params;

    // 1. Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where:   { id: invoiceId },
      include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: "Invoice not found." });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({ success: false, error: "Cannot remind on a paid invoice." });
    }

    // 2. Cooldown check
    const lastReminder = invoice.reminders[0] ?? null;
    if (!canSendReminder(lastReminder?.sentAt)) {
      const hours = cooldownHoursRemaining(lastReminder.sentAt);
      return res.status(429).json({
        success: false,
        error: `Cooldown active. Try again in ${hours} hour${hours !== 1 ? "s" : ""}.`,
      });
    }

    // 3. Save reminder record
    const totalCount = (lastReminder?.count ?? 0) + 1;
    const reminder = await prisma.reminder.create({
      data: { invoiceId: invoice.id, count: totalCount },
    });

    // 4. Log activity
    await prisma.activity.create({
      data: {
        invoiceId:   invoice.id,
        type:        "REMINDER_SENT",
        description: `Payment reminder #${totalCount} sent to ${invoice.clientEmail}`,
      },
    });

    // 5. Respond immediately — don't block on email
    res.status(201).json({
      success: true,
      data: {
        reminder,
        invoice: {
          id:          invoice.id,
          clientName:  invoice.clientName,
          clientEmail: invoice.clientEmail,
        },
        message: `Reminder sent to ${invoice.clientEmail}`,
      },
    });

    // 6. Fire-and-forget email after response is flushed
    emailService.sendReminderEmail({
      clientName:  invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount:      invoice.amount,
      dueDate:     invoice.dueDate,
      invoiceId:   invoice.id,
    }).then(() => {
      console.log(`📧 Email sent to ${invoice.clientEmail}`);
    }).catch((err) => {
      console.error(`[reminderController] Email failed for ${invoice.clientEmail}:`, err.message);
    });
  },

  async getHistory(req, res) {
    const reminders = await reminderService.getHistory(req.params.invoiceId);
    return successResponse(res, { reminders });
  },

  async getCooldownStatus(req, res) {
    const status = await reminderService.getCooldownStatus(req.params.invoiceId);
    return successResponse(res, status);
  },

};