import { formatDueDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CalendarClock, CalendarCheck, CalendarX } from "lucide-react";

// CSS variable mappings per color variant
const variantStyles = {
  overdue: {
    color: "var(--color-overdue-text)",
    backgroundColor: "var(--color-overdue-bg)",
    borderColor: "var(--color-overdue)",
  },
  urgent: {
    // orange — no dedicated token, use pending as closest warm tone
    color: "var(--color-pending-text)",
    backgroundColor: "var(--color-pending-bg)",
    borderColor: "var(--color-pending)",
  },
  soon: {
    color: "var(--color-pending-text)",
    backgroundColor: "var(--color-pending-bg)",
    borderColor: "var(--color-pending)",
  },
  normal: {
    color: "var(--color-text-secondary)",
    backgroundColor: "var(--color-bg-subtle)",
    borderColor: "var(--color-border)",
  },
  paid: {
    color: "var(--color-paid-text)",
    backgroundColor: "var(--color-paid-bg)",
    borderColor: "var(--color-paid)",
  },
};

const variantIcons = {
  overdue: CalendarX,
  urgent: CalendarClock,
  soon: CalendarClock,
  normal: CalendarClock,
  paid: CalendarCheck,
};

/**
 * DueDateLabel
 * @param {string|Date} dueDate
 * @param {"PAID"|"PENDING"|"OVERDUE"} status
 * @param {"badge"|"text"|"full"} variant - display style
 */
export default function DueDateLabel({ dueDate, status, variant = "badge", className }) {
  // formatDueDate returns { label, variant } — unwrap defensively
  const result = formatDueDate(dueDate, status);
  const label = typeof result === "object" && result !== null ? result.label : result;
  const rawVariant = typeof result === "object" && result !== null ? result.variant : null;
  const colorVariant = status === "PAID" ? "paid" : (rawVariant ?? "normal");

  const Icon = variantIcons[colorVariant] ?? CalendarClock;
  const styles = variantStyles[colorVariant] ?? variantStyles.normal;

  if (variant === "text") {
    return (
      <span
        className={cn("text-xs font-medium", className)}
        style={{ color: styles.color }}
      >
        {label}
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Icon size={13} style={{ color: styles.color }} />
        <span
          className="text-sm font-medium"
          style={{ color: styles.color }}
        >
          {label}
        </span>
      </div>
    );
  }

  // badge (default)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 border",
        className
      )}
      style={styles}
    >
      <Icon size={11} className="shrink-0" />
      {label}
    </span>
  );
}