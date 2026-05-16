import { Resend } from "resend";
import { reminderEmailTemplate } from "../templates/reminderEmail.js";
import { formatCurrency, formatDate } from "../lib/utils.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendReminderEmail({ clientName, clientEmail, amount, dueDate, invoiceId }) {
    const formattedAmount = formatCurrency(amount);
    const formattedDate   = formatDate(dueDate);
    const html = reminderEmailTemplate({ clientName, amount: formattedAmount, dueDate: formattedDate, invoiceId });

    try {
      const { error } = await resend.emails.send({
        from:    "DueFlow <onboarding@resend.dev>", // use this until you verify a domain
        to:      clientEmail,
        subject: `Payment Reminder — ${formattedAmount} due on ${formattedDate}`,
        html,
      });

      if (error) {
        console.error("[emailService] Resend error:", error);
        const err = new Error("Failed to send reminder email.");
        err.status = 502;
        throw err;
      }
    } catch (error) {
      console.error("[emailService] Resend error:", error);
      const err = new Error("Failed to send reminder email. Please try again.");
      err.status = 502;
      throw err;
    }
  },
};