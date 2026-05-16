import { z } from "zod";

export const createInvoiceSchema = z.object({
  clientName:  z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email address"),
  amount:      z.coerce.number().positive("Amount must be greater than 0"),
  dueDate:     z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid due date",
  }),
  notes: z.string().max(500).optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
});

export const querySchema = z.object({
  status:  z.enum(["ALL", "PENDING", "PAID", "OVERDUE"]).optional(),
  search:  z.string().optional(),
  sortBy:  z.enum(["amount", "dueDate", "createdAt", "clientName"]).optional(),
  order:   z.enum(["asc", "desc"]).optional(),
});