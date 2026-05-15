// server/src/services/invoiceService.js

import prisma from "../lib/prisma.js";
import { activityService } from "./activityService.js";
import { overdueService }  from "./overdueService.js";

export const invoiceService = {

  // ── Get all invoices (with optional filters) ──────────────────────────
  async getAll({ status, search, sortBy = "createdAt", order = "desc" } = {}) {
    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientName:  { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const validSortFields = ["amount", "dueDate", "createdAt", "clientName"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { [sortField]: order === "asc" ? "asc" : "desc" },
      include: {
        reminders: {
          orderBy: { sentAt: "desc" },
          take: 1, // only the latest reminder
        },
        _count: { select: { reminders: true } },
      },
    });

    // Auto-detect and flip overdue status before returning
    const updated = await overdueService.syncOverdue(invoices);
    return updated;
  },

  // ── Get single invoice by ID ──────────────────────────────────────────
  async getById(id) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        reminders:  { orderBy: { sentAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        _count: { select: { reminders: true } },
      },
    });

    if (!invoice) {
      const err = new Error("Invoice not found.");
      err.status = 404;
      throw err;
    }

    // Sync overdue status for this single invoice
    await overdueService.syncOverdue([invoice]);

    // Re-fetch with updated status
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        reminders:  { orderBy: { sentAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        _count: { select: { reminders: true } },
      },
    });
  },

  // ── Create invoice ────────────────────────────────────────────────────
  async create(data) {
    const invoice = await prisma.invoice.create({
      data: {
        clientName:  data.clientName.trim(),
        clientEmail: data.clientEmail.trim().toLowerCase(),
        amount:      parseFloat(data.amount),
        dueDate:     new Date(data.dueDate),
        notes:       data.notes?.trim() ?? null,
        status:      "PENDING",
      },
    });

    await activityService.log({
      invoiceId:   invoice.id,
      type:        "INVOICE_CREATED",
      description: `Invoice created for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    return invoice;
  },

  // ── Update invoice ────────────────────────────────────────────────────
  async update(id, data) {
    // Confirm invoice exists
    await this.getById(id);

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        clientName:  data.clientName?.trim(),
        clientEmail: data.clientEmail?.trim().toLowerCase(),
        amount:      data.amount !== undefined ? parseFloat(data.amount) : undefined,
        dueDate:     data.dueDate ? new Date(data.dueDate) : undefined,
        notes:       data.notes?.trim() ?? null,
        status:      data.status,
      },
    });

    await activityService.log({
      invoiceId:   updated.id,
      type:        "INVOICE_UPDATED",
      description: `Invoice updated for ${updated.clientName}`,
    });

    // If manually marked paid, log that too
    if (data.status === "PAID") {
      await activityService.log({
        invoiceId:   updated.id,
        type:        "INVOICE_PAID",
        description: `Payment marked as received from ${updated.clientName}`,
      });
    }

    return updated;
  },

  // ── Mark invoice as paid ──────────────────────────────────────────────
  async markPaid(id) {
    const invoice = await this.getById(id);

    if (invoice.status === "PAID") {
      const err = new Error("Invoice is already marked as paid.");
      err.status = 400;
      throw err;
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data:  { status: "PAID" },
    });

    await activityService.log({
      invoiceId:   id,
      type:        "INVOICE_PAID",
      description: `Payment received from ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    return updated;
  },

  // ── Delete invoice ────────────────────────────────────────────────────
  async delete(id) {
    const invoice = await this.getById(id);

    // Log before deletion so we capture the client name
    await activityService.log({
      invoiceId:   null, // invoice is about to be deleted
      type:        "INVOICE_DELETED",
      description: `Invoice deleted for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    await prisma.invoice.delete({ where: { id } });

    return { deleted: true };
  },

  // ── Dashboard stats ───────────────────────────────────────────────────
  async getStats() {
    const [total, paid, pending, overdue, unpaidAgg, reminderCount] =
      await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: "PAID" } }),
        prisma.invoice.count({ where: { status: "PENDING" } }),
        prisma.invoice.count({ where: { status: "OVERDUE" } }),
        prisma.invoice.aggregate({
          _sum: { amount: true },
          where: { status: { in: ["PENDING", "OVERDUE"] } },
        }),
        prisma.reminder.count(),
      ]);

    return {
      total,
      paid,
      pending,
      overdue,
      totalUnpaid: unpaidAgg._sum.amount ?? 0,
      remindersSent: reminderCount,
    };
  },
};