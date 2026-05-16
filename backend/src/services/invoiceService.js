import prisma from "../lib/prisma.js";
import { activityService } from "./activityService.js";
import { overdueService } from "./overdueService.js";

export const invoiceService = {

  async getAll({ status, search, sortBy = "createdAt", order = "desc", userId } = {}) {
    const where = { userId }; // 👈 scope to user

    if (status && status !== "ALL") where.status = status;

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
        reminders: { orderBy: { sentAt: "desc" }, take: 1 },
        _count: { select: { reminders: true } },
      },
    });

    return overdueService.syncOverdue(invoices);
  },

  async getById(id, userId) {
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

    // 👇 Prevent one user from accessing another's invoice
    if (invoice.userId !== userId) {
      const err = new Error("Forbidden.");
      err.status = 403;
      throw err;
    }

    await overdueService.syncOverdue([invoice]);

    return prisma.invoice.findUnique({
      where: { id },
      include: {
        reminders:  { orderBy: { sentAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
        _count: { select: { reminders: true } },
      },
    });
  },

  async create(data, userId) {
    const invoice = await prisma.invoice.create({
      data: {
        userId,                                           // 👈
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
      userId,                                             // 👈
      type:        "INVOICE_CREATED",
      description: `Invoice created for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    return invoice;
  },

  async update(id, data, userId) {
    await this.getById(id, userId); // 👈 also checks ownership

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
      userId,                                             // 👈
      type:        "INVOICE_UPDATED",
      description: `Invoice updated for ${updated.clientName}`,
    });

    if (data.status === "PAID") {
      await activityService.log({
        invoiceId:   updated.id,
        userId,                                           // 👈
        type:        "INVOICE_PAID",
        description: `Payment marked as received from ${updated.clientName}`,
      });
    }

    return updated;
  },

  async markPaid(id, userId) {
    const invoice = await this.getById(id, userId);     // 👈

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
      userId,                                             // 👈
      type:        "INVOICE_PAID",
      description: `Payment received from ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    return updated;
  },

  async delete(id, userId) {
    const invoice = await this.getById(id, userId);     // 👈

    await activityService.log({
      invoiceId:   null,
      userId,                                             // 👈
      type:        "INVOICE_DELETED",
      description: `Invoice deleted for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
    });

    await prisma.invoice.delete({ where: { id } });
    return { deleted: true };
  },

  async getStats(userId) {                              // 👈
    const [total, paid, pending, overdue, unpaidAgg, reminderCount] =
      await Promise.all([
        prisma.invoice.count({ where: { userId } }),
        prisma.invoice.count({ where: { status: "PAID",     userId } }),
        prisma.invoice.count({ where: { status: "PENDING",  userId } }),
        prisma.invoice.count({ where: { status: "OVERDUE",  userId } }),
        prisma.invoice.aggregate({
          _sum: { amount: true },
          where: { status: { in: ["PENDING", "OVERDUE"] }, userId },
        }),
        prisma.reminder.count({ where: { invoice: { userId } } }),
      ]);

    return {
      total,
      paid,
      pending,
      overdue,
      totalUnpaid:   unpaidAgg._sum.amount ?? 0,
      remindersSent: reminderCount,
    };
  },
};