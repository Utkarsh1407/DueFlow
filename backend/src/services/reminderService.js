// server/src/services/reminderService.js

import prisma          from "../lib/prisma.js";
import { emailService }    from "./emailService.js";
import { activityService } from "./activityService.js";
import { canSendReminder, cooldownHoursRemaining } from "../lib/utils.js";

export const reminderService = {

  // ── Send a reminder for an invoice ───────────────────────────────────
  async send(invoiceId) {
    // 1. Fetch invoice
    const invoice = await prisma.invoice.findUnique({
      where:   { id: invoiceId },
      include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
    });

    if (!invoice) {
      const err = new Error("Invoice not found.");
      err.status = 404;
      throw err;
    }

    // 2. Don't send reminders for paid invoices
    if (invoice.status === "PAID") {
      const err = new Error("Cannot send a reminder for a paid invoice.");
      err.status = 400;
      throw err;
    }

    // 3. Cooldown check
    const lastReminder = invoice.reminders[0] ?? null;
    if (!canSendReminder(lastReminder?.sentAt)) {
      const hours = cooldownHoursRemaining(lastReminder.sentAt);
      const err   = new Error(
        `Reminder cooldown active. You can send again in ${hours} hour${hours !== 1 ? "s" : ""}.`
      );
      err.status = 429;
      throw err;
    }

    // 4. Send email via Resend
    await emailService.sendReminderEmail({
      clientName:  invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount:      invoice.amount,
      dueDate:     invoice.dueDate,
      invoiceId:   invoice.id,
    });

    // 5. Persist reminder record
    const totalCount = (lastReminder?.count ?? 0) + 1;
    const reminder = await prisma.reminder.create({
      data: {
        invoiceId: invoice.id,
        count:     totalCount,
      },
    });

    // 6. Log activity
    await activityService.log({
      invoiceId:   invoice.id,
      type:        "REMINDER_SENT",
      description: `Payment reminder #${totalCount} sent to ${invoice.clientEmail}`,
    });

    return {
      reminder,
      message: `Reminder sent to ${invoice.clientEmail}`,
    };
  },

  // ── Get reminder history for an invoice ──────────────────────────────
  async getHistory(invoiceId) {
    return prisma.reminder.findMany({
      where:   { invoiceId },
      orderBy: { sentAt: "desc" },
    });
  },

  // ── Get cooldown status for an invoice ───────────────────────────────
  async getCooldownStatus(invoiceId) {
    const lastReminder = await prisma.reminder.findFirst({
      where:   { invoiceId },
      orderBy: { sentAt: "desc" },
    });

    const canSend = canSendReminder(lastReminder?.sentAt);
    const hoursLeft = cooldownHoursRemaining(lastReminder?.sentAt);

    return {
      canSend,
      hoursLeft,
      lastSentAt: lastReminder?.sentAt ?? null,
      totalSent:  lastReminder?.count  ?? 0,
    };
  },
};