import prisma              from "../lib/prisma.js";
import { emailService }    from "./emailService.js";
import { activityService } from "./activityService.js";
import { canSendReminder, cooldownHoursRemaining } from "../lib/utils.js";

export const reminderService = {
  async send(invoiceId, userId) { // 👈 userId added
    const invoice = await prisma.invoice.findUnique({
      where:   { id: invoiceId },
      include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
    });

    if (!invoice) {
      const err = new Error("Invoice not found.");
      err.status = 404;
      throw err;
    }

    // 👇 Ownership check
    if (invoice.userId !== userId) {
      const err = new Error("Forbidden.");
      err.status = 403;
      throw err;
    }

    if (invoice.status === "PAID") {
      const err = new Error("Cannot send a reminder for a paid invoice.");
      err.status = 400;
      throw err;
    }

    const lastReminder = invoice.reminders[0] ?? null;
    if (!canSendReminder(lastReminder?.sentAt)) {
      const hours = cooldownHoursRemaining(lastReminder.sentAt);
      const err = new Error(
        `Reminder cooldown active. You can send again in ${hours} hour${hours !== 1 ? "s" : ""}.`
      );
      err.status = 429;
      throw err;
    }

    await emailService.sendReminderEmail({
      clientName:  invoice.clientName,
      clientEmail: invoice.clientEmail,
      amount:      invoice.amount,
      dueDate:     invoice.dueDate,
      invoiceId:   invoice.id,
    });

    const totalCount = (lastReminder?.count ?? 0) + 1;
    const reminder = await prisma.reminder.create({
      data: { invoiceId: invoice.id, count: totalCount },
    });

    await activityService.log({
      invoiceId:   invoice.id,
      userId,                    // 👈
      type:        "REMINDER_SENT",
      description: `Payment reminder #${totalCount} sent to ${invoice.clientEmail}`,
    });

    return { reminder, message: `Reminder sent to ${invoice.clientEmail}` };
  },

  async getHistory(invoiceId, userId) { // 👈 userId added
    // Verify ownership before returning history
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) {
      const err = new Error("Invoice not found.");
      err.status = 404;
      throw err;
    }

    if (invoice.userId !== userId) {
      const err = new Error("Forbidden.");
      err.status = 403;
      throw err;
    }

    return prisma.reminder.findMany({
      where:   { invoiceId },
      orderBy: { sentAt: "desc" },
    });
  },

  async getCooldownStatus(invoiceId, userId) { // 👈 userId added
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) {
      const err = new Error("Invoice not found.");
      err.status = 404;
      throw err;
    }

    if (invoice.userId !== userId) {
      const err = new Error("Forbidden.");
      err.status = 403;
      throw err;
    }

    const lastReminder = await prisma.reminder.findFirst({
      where:   { invoiceId },
      orderBy: { sentAt: "desc" },
    });

    return {
      canSend:    canSendReminder(lastReminder?.sentAt),
      hoursLeft:  cooldownHoursRemaining(lastReminder?.sentAt),
      lastSentAt: lastReminder?.sentAt ?? null,
      totalSent:  lastReminder?.count  ?? 0,
    };
  },
};