// server/src/services/emailService.js

import resend              from "../lib/resend.js";
import { reminderEmailTemplate } from "../templates/reminderEmail.js";
import { formatCurrency, formatDate } from "../lib/utils.js";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "DueFlow <reminders@yourdomain.com>";

export const emailService = {

  // ── Send payment reminder email ───────────────────────────────────────
  async sendReminderEmail({ clientName, clientEmail, amount, dueDate, invoiceId }) {
    const formattedAmount = formatCurrency(amount);
    const formattedDate   = formatDate(dueDate);

    const html = reminderEmailTemplate({
      clientName,
      amount: formattedAmount,
      dueDate: formattedDate,
      invoiceId,
    });

    const { data, error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [clientEmail],
      subject: `Payment Reminder — ${formattedAmount} due on ${formattedDate}`,
      html,
    });

    if (error) {
      console.error("[emailService] Resend error:", error);
      const err = new Error("Failed to send reminder email. Please try again.");
      err.status = 502;
      throw err;
    }

    return data;
  },
};