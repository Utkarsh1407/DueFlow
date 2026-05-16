import mailer from "../lib/mailer.js";
import { reminderEmailTemplate } from "../templates/reminderEmail.js";
import { formatCurrency, formatDate } from "../lib/utils.js";

const FROM_EMAIL = process.env.FROM_EMAIL ?? `"DueFlow" <${process.env.GMAIL_USER}>`;

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

    try {
      const info = await mailer.sendMail({
        from:    FROM_EMAIL,
        to:      clientEmail,        // nodemailer accepts a plain string or array
        subject: `Payment Reminder — ${formattedAmount} due on ${formattedDate}`,
        html,
      });

      return info;
    } catch (error) {
      console.error("[emailService] Nodemailer error:", error);
      const err = new Error("Failed to send reminder email. Please try again.");
      err.status = 502;
      throw err;
    }
  },
};