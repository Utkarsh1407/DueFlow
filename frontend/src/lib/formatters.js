import { formatDistanceToNow, format, differenceInDays, isPast, isToday, isTomorrow } from "date-fns";

// ─── Currency ──────────────────────────────────────────────────────────────────

/**
 * Format a number as a locale currency string.
 * @param {number} amount
 * @param {string} currency  ISO 4217 code, defaults to INR
 * @param {string} locale
 * @returns {string}  e.g. "₹1,250.00"
 */
export const formatCurrency = (amount = 0, currency = "INR", locale = "en-IN") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/**
 * Compact currency for dashboard stat cards (e.g. "₹12.4K", "₹1.2M").
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrencyCompact = (amount = 0, currency = "INR") => {
  if (Math.abs(amount) >= 1_000_000) {
    return `${formatCurrency(amount / 1_000_000, currency).replace(".00", "")}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${formatCurrency(amount / 1_000, currency).replace(".00", "")}K`;
  }
  return formatCurrency(amount, currency);
};

// ─── Dates ────────────────────────────────────────────────────────────────────

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @param {string} pattern  date-fns format token
 * @returns {string}  e.g. "Jan 15, 2025"
 */
export const formatDate = (date, pattern = "MMM d, yyyy") => {
  if (!date) return "—";
  try {
    return format(new Date(date), pattern);
  } catch {
    return "Invalid date";
  }
};

/**
 * Format a date + time.
 * @param {string|Date} date
 * @returns {string}  e.g. "Jan 15, 2025 at 3:42 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return "Invalid date";
  }
};

/**
 * Human-friendly relative time (e.g. "3 days ago", "in 2 hours").
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  if (!date) return "—";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "—";
  }
};

/**
 * Smart due date label for invoices.
 * Returns context-aware strings like "Due tomorrow", "Overdue by 5 days",
 * "Due in 3 days", or a plain formatted date for far-future dates.
 *
 * @param {string|Date} dueDate
 * @param {"PENDING"|"PAID"|"OVERDUE"} status
 * @returns {{ label: string, variant: "success"|"warning"|"danger"|"muted" }}
 */
export const formatDueDate = (dueDate, status) => {
  if (!dueDate) return { label: "No due date", variant: "muted" };

  // Paid invoices just show the date
  if (status === "PAID") {
    return { label: formatDate(dueDate), variant: "success" };
  }

  const date = new Date(dueDate);
  const diff = differenceInDays(date, new Date());

  if (isPast(date) && !isToday(date)) {
    const days = Math.abs(diff);
    return {
      label: `Overdue by ${days} day${days !== 1 ? "s" : ""}`,
      variant: "danger",
    };
  }

  if (isToday(date)) {
    return { label: "Due today", variant: "danger" };
  }

  if (isTomorrow(date)) {
    return { label: "Due tomorrow", variant: "warning" };
  }

  if (diff <= 7) {
    return { label: `Due in ${diff} days`, variant: "warning" };
  }

  return { label: `Due ${formatDate(dueDate)}`, variant: "muted" };
};

// ─── Invoice Status ───────────────────────────────────────────────────────────

/**
 * Map an invoice status to display metadata.
 * @param {"PENDING"|"PAID"|"OVERDUE"} status
 * @returns {{ label: string, color: string, bg: string, dot: string }}
 */
export const formatStatus = (status) => {
  const map = {
    PAID: {
      label: "Paid",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    PENDING: {
      label: "Pending",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    OVERDUE: {
      label: "Overdue",
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500",
    },
  };

  return (
    map[status] ?? {
      label: status ?? "Unknown",
      color: "text-zinc-600",
      bg: "bg-zinc-100",
      border: "border-zinc-200",
      dot: "bg-zinc-400",
    }
  );
};

// ─── Activity ─────────────────────────────────────────────────────────────────

/**
 * Map an activity type to a human-readable label and icon name.
 * @param {string} type
 * @returns {{ label: string, icon: string, color: string }}
 */
export const formatActivityType = (type) => {
  const map = {
    INVOICE_CREATED:   { label: "Invoice created",    icon: "FilePlus",    color: "text-blue-500" },
    INVOICE_UPDATED:   { label: "Invoice updated",    icon: "FilePen",     color: "text-indigo-500" },
    INVOICE_DELETED:   { label: "Invoice deleted",    icon: "Trash2",      color: "text-zinc-500" },
    MARKED_PAID:       { label: "Marked as paid",     icon: "CheckCircle", color: "text-emerald-500" },
    REMINDER_SENT:     { label: "Reminder sent",      icon: "Mail",        color: "text-violet-500" },
    OVERDUE_DETECTED:  { label: "Marked overdue",     icon: "AlertCircle", color: "text-red-500" },
  };

  return map[type] ?? { label: type, icon: "Activity", color: "text-zinc-500" };
};

// ─── Numbers ──────────────────────────────────────────────────────────────────

/**
 * Format a plain number with locale-aware thousand separators.
 * @param {number} n
 * @returns {string}
 */
export const formatNumber = (n = 0) =>
  new Intl.NumberFormat("en-US").format(n);

/**
 * Calculate a percentage, safely handling division by zero.
 * @param {number} part
 * @param {number} total
 * @param {number} decimals
 * @returns {number}
 */
export const percentage = (part, total, decimals = 1) => {
  if (!total) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
};

// ─── File Size ────────────────────────────────────────────────────────────────

/**
 * Convert bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export const formatBytes = (bytes = 0) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export function getDueDateVariant(dueDate, status) {
  // Paid invoices always use paid styling
  if (status === "PAID") return "paid";

  const today = new Date();
  const due = new Date(dueDate);

  // Remove time portion for accurate day comparison
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffInMs = due - today;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  // Already overdue
  if (diffInDays < 0 || status === "OVERDUE") {
    return "overdue";
  }

  // Due today or tomorrow
  if (diffInDays <= 1) {
    return "urgent";
  }

  // Due within a week
  if (diffInDays <= 7) {
    return "soon";
  }

  // Everything else
  return "normal";
}