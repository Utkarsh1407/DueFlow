import prisma from "../lib/prisma.js";

export const activityService = {
  async log({ invoiceId = null, userId = null, type, description }) {
    return prisma.activity.create({
      data: { invoiceId, userId, type, description }, // 👈 userId added
    });
  },

  async getAll({ limit = 50, offset = 0, userId } = {}) {
    const where = { userId }; // 👈 scope to user

    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip:    offset,
        include: {
          invoice: {
            select: { id: true, clientName: true, amount: true, status: true },
          },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return { items, total };
  },

  async getByInvoice(invoiceId) {
    // Already scoped by invoiceId — no change needed
    return prisma.activity.findMany({
      where:   { invoiceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getRecent(limit = 10, userId) { // 👈 userId added
    return prisma.activity.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    limit,
      include: {
        invoice: {
          select: { id: true, clientName: true, amount: true },
        },
      },
    });
  },
};