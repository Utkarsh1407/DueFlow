// prisma/seed.js
// Run: node prisma/seed.js  OR  npx prisma db seed

import { PrismaClient, InvoiceStatus, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const randomAmount = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

// ── Seed data ─────────────────────────────
const INVOICES = [
  {
    clientName:  "Arjun Mehta",
    clientEmail: "arjun@mehtatech.in",
    amount:      24500,
    dueDate:     daysFromNow(7),
    status:      InvoiceStatus.PENDING,
    notes:       "Website redesign — Phase 1 milestone payment.",
  },
  {
    clientName:  "Priya Sharma",
    clientEmail: "priya@sharmadesigns.in",
    amount:      8750,
    dueDate:     daysFromNow(-3),   // already overdue
    status:      InvoiceStatus.OVERDUE,
    notes:       "Logo & brand identity package.",
  },
  {
    clientName:  "Rohan Kapoor",
    clientEmail: "rohan@kapoorstudio.com",
    amount:      52000,
    dueDate:     daysFromNow(-10),  // overdue
    status:      InvoiceStatus.OVERDUE,
    notes:       "Mobile app UI/UX — full project.",
  },
  {
    clientName:  "Sneha Iyer",
    clientEmail: "sneha@iyerconsulting.com",
    amount:      15000,
    dueDate:     daysFromNow(1),    // due tomorrow
    status:      InvoiceStatus.PENDING,
    notes:       "Monthly retainer — May 2025.",
  },
  {
    clientName:  "Vikram Nair",
    clientEmail: "vikram@nairventures.in",
    amount:      36000,
    dueDate:     daysFromNow(-20),
    status:      InvoiceStatus.PAID,
    notes:       "E-commerce integration — final invoice.",
  },
  {
    clientName:  "Deepa Patel",
    clientEmail: "deepa@patelexports.com",
    amount:      9200,
    dueDate:     daysFromNow(14),
    status:      InvoiceStatus.PENDING,
    notes:       "Social media content — April batch.",
  },
  {
    clientName:  "Aditya Joshi",
    clientEmail: "aditya@joshitech.io",
    amount:      67500,
    dueDate:     daysFromNow(-5),
    status:      InvoiceStatus.PAID,
    notes:       "Backend API development — Q1 project.",
  },
  {
    clientName:  "Kavya Reddy",
    clientEmail: "kavya@reddymedia.co",
    amount:      12400,
    dueDate:     daysFromNow(3),    // due in 3 days
    status:      InvoiceStatus.PENDING,
    notes:       "Video editing — 3 product reels.",
  },
];

async function main() {
  console.log("🌱  Seeding DueFlow database...\n");

  // Clean existing data (order matters for FK constraints)
  await prisma.activity.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.invoice.deleteMany();
  console.log("🗑   Cleared existing records.");

  for (const invoiceData of INVOICES) {
    // Create invoice
    const invoice = await prisma.invoice.create({ data: invoiceData });
    console.log(`✅  Invoice created — ${invoice.clientName} (${invoice.status})`);

    // Log INVOICE_CREATED activity
    await prisma.activity.create({
      data: {
        invoiceId:   invoice.id,
        type:        ActivityType.INVOICE_CREATED,
        description: `Invoice created for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
        createdAt:   invoice.createdAt,
      },
    });

    // For PAID invoices — add a paid activity
    if (invoice.status === InvoiceStatus.PAID) {
      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          type:        ActivityType.INVOICE_PAID,
          description: `Payment received from ${invoice.clientName}`,
          createdAt:   new Date(invoice.createdAt.getTime() + 1000 * 60 * 60 * 24 * 3),
        },
      });
    }

    // For OVERDUE invoices — add overdue activity + a reminder
    if (invoice.status === InvoiceStatus.OVERDUE) {
      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          type:        ActivityType.INVOICE_OVERDUE,
          description: `Invoice overdue for ${invoice.clientName}`,
        },
      });

      // Add one reminder sent
      const reminderSentAt = new Date(Date.now() - 1000 * 60 * 60 * 12); // 12h ago
      await prisma.reminder.create({
        data: {
          invoiceId: invoice.id,
          sentAt:    reminderSentAt,
          count:     1,
        },
      });
      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          type:        ActivityType.REMINDER_SENT,
          description: `Payment reminder sent to ${invoice.clientEmail}`,
          createdAt:   reminderSentAt,
        },
      });
    }
  }

  // Summary
  const counts = await Promise.all([
    prisma.invoice.count(),
    prisma.reminder.count(),
    prisma.activity.count(),
  ]);

  console.log(`
──────────────────────────────
✅  Seed complete!
   Invoices  : ${counts[0]}
   Reminders : ${counts[1]}
   Activities: ${counts[2]}
──────────────────────────────
  `);
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());