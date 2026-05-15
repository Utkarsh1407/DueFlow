// server/src/services/overdueService.js

import prisma          from "../lib/prisma.js";
import { activityService } from "./activityService.js";
import { isPastDue }   from "../lib/utils.js";

export const overdueService = {

  // ── Sync overdue status for a list of invoices ────────────────────────
  // Called automatically on every getAll / getById so status is always fresh.
  async syncOverdue(invoices) {
    const toMarkOverdue = invoices.filter(
      (inv) => inv.status === "PENDING" && isPastDue(inv.dueDate)
    );

    if (toMarkOverdue.length === 0) return invoices;

    // Bulk update in one query
    await prisma.invoice.updateMany({
      where: {
        id:     { in: toMarkOverdue.map((inv) => inv.id) },
        status: "PENDING",
      },
      data: { status: "OVERDUE" },
    });

    // Log an activity for each newly overdue invoice
    await Promise.all(
      toMarkOverdue.map((inv) =>
        activityService.log({
          invoiceId:   inv.id,
          type:        "INVOICE_OVERDUE",
          description: `Invoice for ${inv.clientName} is now overdue`,
        })
      )
    );

    // Return invoices with status patched in memory
    // (avoids a second DB round-trip)
    return invoices.map((inv) =>
      toMarkOverdue.find((o) => o.id === inv.id)
        ? { ...inv, status: "OVERDUE" }
        : inv
    );
  },

  // ── Standalone job — scan ALL pending invoices for overdue ────────────
  // Can be called from a cron job or on server startup.
  async runFullScan() {
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: "PENDING" },
      select: { id: true, clientName: true, dueDate: true, status: true },
    });

    const result = await this.syncOverdue(pendingInvoices);
    const markedCount = result.filter((inv) => inv.status === "OVERDUE").length;

    console.log(`[overdueService] Full scan complete. Marked ${markedCount} invoice(s) as overdue.`);
    return { scanned: pendingInvoices.length, markedOverdue: markedCount };
  },
};