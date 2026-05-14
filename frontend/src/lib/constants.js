// ─── Invoice Status ───────────────────────────────────────────────────────────

export const INVOICE_STATUS = /** @type {const} */ ({
  PENDING: "PENDING",
  PAID:    "PAID",
  OVERDUE: "OVERDUE",
});

/** Ordered list used in filter dropdowns. */
export const INVOICE_STATUS_OPTIONS = [
  { value: "",                      label: "All Statuses" },
  { value: INVOICE_STATUS.PENDING,  label: "Pending" },
  { value: INVOICE_STATUS.PAID,     label: "Paid" },
  { value: INVOICE_STATUS.OVERDUE,  label: "Overdue" },
];

// ─── Activity Types ───────────────────────────────────────────────────────────

export const ACTIVITY_TYPE = /** @type {const} */ ({
  INVOICE_CREATED:  "INVOICE_CREATED",
  INVOICE_UPDATED:  "INVOICE_UPDATED",
  INVOICE_DELETED:  "INVOICE_DELETED",
  MARKED_PAID:      "MARKED_PAID",
  REMINDER_SENT:    "REMINDER_SENT",
  OVERDUE_DETECTED: "OVERDUE_DETECTED",
});

// ─── Reminder Cooldown ────────────────────────────────────────────────────────

/** Minimum hours between reminder sends for the same invoice. */
export const REMINDER_COOLDOWN_HOURS = 24;

/** In milliseconds — used for client-side cooldown checks. */
export const REMINDER_COOLDOWN_MS = REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000;

// ─── Sorting ──────────────────────────────────────────────────────────────────

export const SORT_DIRECTION = /** @type {const} */ ({
  ASC:  "asc",
  DESC: "desc",
});

export const INVOICE_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc",  label: "Oldest first" },
  { value: "dueDate:asc",    label: "Due date (soonest)" },
  { value: "dueDate:desc",   label: "Due date (latest)" },
  { value: "amount:desc",    label: "Amount (high → low)" },
  { value: "amount:asc",     label: "Amount (low → high)" },
  { value: "clientName:asc", label: "Client A–Z" },
];

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** Number of recent activities shown on the dashboard feed. */
export const DASHBOARD_ACTIVITY_LIMIT = 8;

/** Recharts colour palette for invoice status pie/bar chart. */
export const CHART_COLORS = {
  PAID:    "#22c55e",   // emerald-500
  PENDING: "#f59e0b",   // amber-400
  OVERDUE: "#ef4444",   // red-500
};

/** Ordered series for the status distribution chart. */
export const STATUS_CHART_SERIES = [
  { key: INVOICE_STATUS.PAID,    name: "Paid",    fill: CHART_COLORS.PAID },
  { key: INVOICE_STATUS.PENDING, name: "Pending", fill: CHART_COLORS.PENDING },
  { key: INVOICE_STATUS.OVERDUE, name: "Overdue", fill: CHART_COLORS.OVERDUE },
];

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = /** @type {const} */ ({
  DASHBOARD:      "/",
  INVOICES:       "/invoices",
  INVOICE_NEW:    "/invoices/new",
  INVOICE_DETAIL: (id = ":id") => `/invoices/${id}`,
  INVOICE_EDIT:   (id = ":id") => `/invoices/${id}/edit`,
  REMINDERS:      "/reminders",
  ACTIVITY:       "/activity",
});

// ─── Query Keys (React Query / SWR cache keys) ────────────────────────────────

export const QUERY_KEYS = {
  DASHBOARD_STATS:    ["dashboard", "stats"],
  DASHBOARD_ACTIVITY: ["dashboard", "activity"],
  INVOICES:           (params = {}) => ["invoices", params],
  INVOICE:            (id)          => ["invoices", id],
  INVOICE_ACTIVITY:   (id)          => ["invoices", id, "activity"],
  INVOICE_REMINDERS:  (id)          => ["invoices", id, "reminders"],
  REMINDERS:          (params = {}) => ["reminders", params],
  ACTIVITY:           (params = {}) => ["activity", params],
};

// ─── Validation ───────────────────────────────────────────────────────────────

export const INVOICE_AMOUNT = {
  MIN: 0.01,
  MAX: 10_000_000,
};

export const FIELD_LENGTHS = {
  CLIENT_NAME_MAX:  100,
  CLIENT_EMAIL_MAX: 254,
  NOTES_MAX:        1000,
};

// ─── UI ───────────────────────────────────────────────────────────────────────

/** Delay (ms) before showing loading skeletons to avoid flash on fast networks. */
export const SKELETON_DELAY_MS = 150;

/** Toast duration in ms. */
export const TOAST_DURATION = {
  DEFAULT: 4000,
  ERROR:   6000,
  SUCCESS: 3000,
};

/** Number of items per page in activity timeline. */
export const ACTIVITY_PAGE_SIZE = 20;

// ─── App Metadata ─────────────────────────────────────────────────────────────

export const APP_NAME    = "DueFlow";
export const APP_TAGLINE = "Smart invoicing & payment reminders";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";