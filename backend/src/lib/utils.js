// server/src/lib/utils.js

// ─────────────────────────────────────────
//  DATE HELPERS
// ─────────────────────────────────────────

/**
 * Returns true if the given date is in the past (before today's midnight).
 */
export function isPastDue(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(dueDate) < now;
}

/**
 * Human-friendly due date label.
 * e.g. "Due tomorrow", "Due in 3 days", "Overdue by 5 days", "Due today"
 */
export function dueDateLabel(dueDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs   = due - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)  return "Due today";
  if (diffDays === 1)  return "Due tomorrow";
  if (diffDays === -1) return "Overdue by 1 day";
  if (diffDays > 1)    return `Due in ${diffDays} days`;
  return `Overdue by ${Math.abs(diffDays)} days`;
}

/**
 * Format a JS Date to a readable string: "12 May 2025"
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

// ─────────────────────────────────────────
//  CURRENCY HELPERS
// ─────────────────────────────────────────

/**
 * Format a number as Indian Rupees: ₹24,500.00
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
  }).format(amount);
}

// ─────────────────────────────────────────
//  REMINDER COOLDOWN
// ─────────────────────────────────────────

const COOLDOWN_HOURS = 24;

/**
 * Returns true if a reminder can be sent (cooldown has passed or none sent yet).
 * @param {Date|null} lastSentAt - timestamp of the most recent reminder
 */
export function canSendReminder(lastSentAt) {
  if (!lastSentAt) return true;
  const diffMs    = Date.now() - new Date(lastSentAt).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= COOLDOWN_HOURS;
}

/**
 * Returns how many hours remain in the cooldown window.
 * Returns 0 if cooldown has already passed.
 */
export function cooldownHoursRemaining(lastSentAt) {
  if (!lastSentAt) return 0;
  const diffMs    = Date.now() - new Date(lastSentAt).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const remaining = COOLDOWN_HOURS - diffHours;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

// ─────────────────────────────────────────
//  RESPONSE HELPERS
// ─────────────────────────────────────────

/**
 * Standard success response shape.
 */
export function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

/**
 * Standard error response shape.
 */
export function errorResponse(res, message, statusCode = 500) {
  return res.status(statusCode).json({ success: false, error: message });
}

// ─────────────────────────────────────────
//  STRING HELPERS
// ─────────────────────────────────────────

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate a string to maxLength and append "…" if needed.
 */
export function truncate(str = "", maxLength = 60) {
  return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
}