import { useEffect } from "react";
import { Bell, Mail, MailCheck, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

/**
 * ReminderHistory
 *
 * Renders a scrollable timeline of reminders sent for an invoice.
 *
 * Props:
 *  - invoiceId     : string
 *  - reminders     : Reminder[]   — from useReminders
 *  - loading       : boolean
 *  - onMount       : () => void   — call fetchHistory on mount
 *  - className     : string
 *
 * All colors reference CSS custom properties so the light↔dark toggle in
 * globals.css is respected automatically — no Tailwind dark: prefixes needed.
 */
export function ReminderHistory({
  invoiceId,
  reminders = [],
  loading = false,
  onMount,
  className,
}) {
  useEffect(() => {
    if (onMount) onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Reminder History
          </h3>
        </div>
        {reminders.length > 0 && (
          <span className="text-xs text-[var(--color-text-muted)] font-medium">
            {reminders.length} sent
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className={cn(
          "rounded-xl border border-[var(--color-border)]",
          "bg-[var(--color-bg-subtle)]",
          "overflow-hidden"
        )}
      >
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading history…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <div className="w-9 h-9 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center">
              <Inbox className="w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
              No reminders sent yet
            </p>
            <p className="text-xs text-[var(--color-text-muted)] max-w-[200px]">
              Send a reminder to notify your client about this invoice.
            </p>
          </div>
        )}

        {/* Timeline list */}
        {!loading && reminders.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {reminders.map((reminder, index) => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                isLatest={index === 0}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Single reminder entry ──────────────────────────────────────────────────

function ReminderItem({ reminder, isLatest }) {
  const sentDate = new Date(reminder.sentAt);
  const relativeTime = formatDistanceToNow(sentDate, { addSuffix: true });
  const absoluteTime = format(sentDate, "MMM d, yyyy 'at' h:mm a");

  return (
    <li className="flex items-start gap-3 px-4 py-3 group hover:bg-[var(--color-bg-hover)] transition-colors duration-100">
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
          // Keep blue for the "latest" semantic — no equivalent in the design tokens
          isLatest
            ? "bg-blue-100 dark:bg-blue-900/30"
            : "bg-[var(--color-bg-hover)]"
        )}
      >
        {isLatest ? (
          <MailCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            Reminder #{reminder.count ?? "—"} sent
            {isLatest && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                Latest
              </span>
            )}
          </p>
          <span
            className="flex-shrink-0 text-[11px] text-[var(--color-text-muted)]"
            title={absoluteTime}
          >
            {relativeTime}
          </span>
        </div>

        {/* Recipient */}
        {reminder.clientEmail && (
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)] truncate">
            → {reminder.clientEmail}
          </p>
        )}

        {/* Absolute timestamp (shown on hover) */}
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {absoluteTime}
        </p>
      </div>
    </li>
  );
}