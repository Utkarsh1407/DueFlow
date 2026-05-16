import prisma from "../lib/prisma.js";
import { activityService } from "./activityService.js";
import { isPastDue } from "../lib/utils.js";

export const overdueService = {
  async syncOverdue(invoices) {
    const toMarkOverdue = invoices.filter(
      (inv) => inv.status === "PENDING" && isPastDue(inv.dueDate)
    );
    if (toMarkOverdue.length === 0) return invoices;

    await prisma.invoice.updateMany({
      where: { id: { in: toMarkOverdue.map((inv) => inv.id) }, status: "PENDING" },
      data:  { status: "OVERDUE" },
    });

    await Promise.all(
      toMarkOverdue.map((inv) =>
        activityService.log({
          invoiceId:   inv.id,
          userId:      inv.userId, // 👈 inv already has userId from the query
          type:        "INVOICE_OVERDUE",
          description: `Invoice for ${inv.clientName} is now overdue`,
        })
      )
    );

    return invoices.map((inv) =>
      toMarkOverdue.find((o) => o.id === inv.id)
        ? { ...inv, status: "OVERDUE" }
        : inv
    );
  },

  async runFullScan() {
    const pendingInvoices = await prisma.invoice.findMany({
      where:  { status: "PENDING" },
      select: { id: true, clientName: true, dueDate: true, status: true, userId: true }, // 👈 include userId
    });

    const result = await this.syncOverdue(pendingInvoices);
    const markedCount = result.filter((inv) => inv.status === "OVERDUE").length;
    console.log(`[overdueService] Full scan complete. Marked ${markedCount} invoice(s) as overdue.`);
    return { scanned: pendingInvoices.length, markedOverdue: markedCount };
  },
};