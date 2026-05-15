// server/src/services/activityService.js

import prisma from "../lib/prisma.js";

export const activityService = {

  // ── Log a new activity event ──────────────────────────────────────────
  async log({ invoiceId = null, type, description }) {
    return prisma.activity.create({
      data: {
        invoiceId,
        type,
        description,
      },
    });
  },

  // ── Get all activity (global feed — dashboard + activity page) ────────
  async getAll({ limit = 50, offset = 0 } = {}) {
    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip:    offset,
        include: {
          invoice: {
            select: {
              id:         true,
              clientName: true,
              amount:     true,
              status:     true,
            },
          },
        },
      }),
      prisma.activity.count(),
    ]);

    return { items, total };
  },

  // ── Get activity for a single invoice ─────────────────────────────────
  async getByInvoice(invoiceId) {
    return prisma.activity.findMany({
      where:   { invoiceId },
      orderBy: { createdAt: "desc" },
    });
  },

  // ── Get recent activity (for dashboard feed) ──────────────────────────
  async getRecent(limit = 10) {
    return prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take:    limit,
      include: {
        invoice: {
          select: {
            id:         true,
            clientName: true,
            amount:     true,
          },
        },
      },
    });
  },
};