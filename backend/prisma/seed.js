// prisma/seed.js
import { PrismaClient, InvoiceStatus, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

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
    dueDate:     daysFromNow(-3),
    status:      InvoiceStatus.OVERDUE,
    notes:       "Logo & brand identity package.",
  },
  {
    clientName:  "Rohan Kapoor",
    clientEmail: "rohan@kapoorstudio.com",
    amount:      52000,
    dueDate:     daysFromNow(-10),
    status:      InvoiceStatus.OVERDUE,
    notes:       "Mobile app UI/UX — full project.",
  },
  {
    clientName:  "Sneha Iyer",
    clientEmail: "sneha@iyerconsulting.com",
    amount:      15000,
    dueDate:     daysFromNow(1),
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
    dueDate:     daysFromNow(3),
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
  await prisma.user.deleteMany(); // 👈 clear users too
  console.log("🗑   Cleared existing records.");

  // 👇 Create a seed test user — replace this ID with your actual Clerk user ID
  // To find it: Clerk Dashboard → Users → click your account → copy the user ID
  const SEED_USER_ID = process.env.SEED_USER_ID ?? "user_seed_placeholder";

  const user = await prisma.user.upsert({
    where:  { id: SEED_USER_ID },
    update: {},
    create: { id: SEED_USER_ID },
  });
  console.log(`👤  Seed user ready: ${user.id}`);

  for (const invoiceData of INVOICES) {
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        userId: user.id, // 👈 attach to seed user
      },
    });
    console.log(`✅  Invoice created — ${invoice.clientName} (${invoice.status})`);

    await prisma.activity.create({
      data: {
        invoiceId:   invoice.id,
        userId:      user.id, // 👈
        type:        ActivityType.INVOICE_CREATED,
        description: `Invoice created for ${invoice.clientName} — ₹${invoice.amount.toLocaleString("en-IN")}`,
        createdAt:   invoice.createdAt,
      },
    });

    if (invoice.status === InvoiceStatus.PAID) {
      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          userId:      user.id, // 👈
          type:        ActivityType.INVOICE_PAID,
          description: `Payment received from ${invoice.clientName}`,
          createdAt:   new Date(invoice.createdAt.getTime() + 1000 * 60 * 60 * 24 * 3),
        },
      });
    }

    if (invoice.status === InvoiceStatus.OVERDUE) {
      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          userId:      user.id, // 👈
          type:        ActivityType.INVOICE_OVERDUE,
          description: `Invoice overdue for ${invoice.clientName}`,
        },
      });

      const reminderSentAt = new Date(Date.now() - 1000 * 60 * 60 * 12);
      await prisma.reminder.create({
        data: { invoiceId: invoice.id, sentAt: reminderSentAt, count: 1 },
      });

      await prisma.activity.create({
        data: {
          invoiceId:   invoice.id,
          userId:      user.id, // 👈
          type:        ActivityType.REMINDER_SENT,
          description: `Payment reminder sent to ${invoice.clientEmail}`,
          createdAt:   reminderSentAt,
        },
      });
    }
  }

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