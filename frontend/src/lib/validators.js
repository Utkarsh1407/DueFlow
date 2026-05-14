import { z } from "zod";
import { INVOICE_STATUS, INVOICE_AMOUNT, FIELD_LENGTHS } from "./constants";

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Non-empty trimmed string. */
const nonEmptyString = (label = "Field", max = 255) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

/** Validated email address. */
const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(FIELD_LENGTHS.CLIENT_EMAIL_MAX, "Email is too long")
  .email("Please enter a valid email address");

/** Positive currency amount. */
const amountField = z
  .number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  })
  .min(INVOICE_AMOUNT.MIN, `Amount must be at least $${INVOICE_AMOUNT.MIN}`)
  .max(INVOICE_AMOUNT.MAX, `Amount cannot exceed $${INVOICE_AMOUNT.MAX.toLocaleString()}`)
  .multipleOf(0.01, "Amount can have at most 2 decimal places");

/**
 * Helper: coerce a string like "123.45" from an <input type="text">
 * into the number 123.45 expected by amountField.
 */
export const coerceAmount = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const n = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : val;
    return isNaN(n) ? undefined : n;
  })
  .pipe(amountField);

// ─── Invoice Schemas ──────────────────────────────────────────────────────────

/**
 * Schema for the Create Invoice form / POST /invoices body.
 */
export const createInvoiceSchema = z.object({
  clientName: nonEmptyString("Client name", FIELD_LENGTHS.CLIENT_NAME_MAX),

  clientEmail: emailField,

  amount: coerceAmount,

  dueDate: z
    .string({ required_error: "Due date is required" })
    .min(1, "Due date is required")
    .refine(
      (v) => !isNaN(Date.parse(v)),
      "Please enter a valid date"
    )
    .refine(
      (v) => new Date(v) > new Date(new Date().setHours(0, 0, 0, 0)),
      "Due date must be in the future"
    ),

  notes: z
    .string()
    .trim()
    .max(FIELD_LENGTHS.NOTES_MAX, `Notes must be ${FIELD_LENGTHS.NOTES_MAX} characters or fewer`)
    .optional()
    .or(z.literal("")),
});

/**
 * Schema for the Edit Invoice form / PUT /invoices/:id body.
 * Identical fields, but dueDate allows past values (invoice may already exist).
 */
export const updateInvoiceSchema = createInvoiceSchema.extend({
  dueDate: z
    .string({ required_error: "Due date is required" })
    .min(1, "Due date is required")
    .refine((v) => !isNaN(Date.parse(v)), "Please enter a valid date"),

  status: z.enum(
    [INVOICE_STATUS.PENDING, INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE],
    { errorMap: () => ({ message: "Invalid status value" }) }
  ),
});

/** Type helpers for TypeScript-style usage in JS with JSDoc */
/**
 * @typedef {z.infer<typeof createInvoiceSchema>} CreateInvoiceInput
 * @typedef {z.infer<typeof updateInvoiceSchema>} UpdateInvoiceInput
 */

// ─── Search / Filter Schemas ──────────────────────────────────────────────────

/**
 * Query params schema for GET /invoices.
 * All fields are optional; used to validate URL search param objects.
 */
export const invoiceQuerySchema = z.object({
  search: z.string().trim().optional(),

  status: z
    .enum([INVOICE_STATUS.PENDING, INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE, ""])
    .optional(),

  sortBy: z
    .enum(["createdAt", "dueDate", "amount", "clientName"])
    .optional()
    .default("createdAt"),

  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),

  page: z
    .union([z.string(), z.number()])
    .transform((v) => Math.max(1, parseInt(String(v), 10) || 1))
    .optional()
    .default(1),

  limit: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = parseInt(String(v), 10);
      return [10, 25, 50, 100].includes(n) ? n : 10;
    })
    .optional()
    .default(10),
});

// ─── Reminder Schemas ─────────────────────────────────────────────────────────

/**
 * Body schema for POST /reminders/send/:invoiceId (no body required yet,
 * but having the schema makes it easy to extend with custom message, etc.).
 */
export const sendReminderSchema = z.object({
  customMessage: z
    .string()
    .trim()
    .max(500, "Custom message must be 500 characters or fewer")
    .optional(),
});

// ─── Shared Utilities ─────────────────────────────────────────────────────────

/**
 * Safely parse a Zod schema, returning { data, success, errors }.
 * `errors` is a flat record of field → first error message.
 *
 * @template T
 * @param {z.ZodType<T>} schema
 * @param {unknown} input
 * @returns {{ success: true; data: T; errors: {} } | { success: false; data: null; errors: Record<string, string> }}
 */
export const safeParse = (schema, input) => {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors = Object.fromEntries(
    result.error.errors.map((e) => [
      e.path.join(".") || "root",
      e.message,
    ])
  );

  return { success: false, data: null, errors };
};

/**
 * Convert a Zod error into an object compatible with React Hook Form's
 * `setError` calls: { fieldName: { type: "manual", message: "…" } }.
 *
 * Usage:
 *   const rhfErrors = zodToRhfErrors(zodError);
 *   Object.entries(rhfErrors).forEach(([field, err]) => setError(field, err));
 *
 * @param {z.ZodError} zodError
 * @returns {Record<string, { type: "manual"; message: string }>}
 */
export const zodToRhfErrors = (zodError) =>
  Object.fromEntries(
    zodError.errors.map((e) => [
      e.path.join("."),
      { type: "manual", message: e.message },
    ])
  );