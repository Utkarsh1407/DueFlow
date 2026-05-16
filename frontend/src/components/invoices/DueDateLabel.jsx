import { formatDueDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CalendarClock, CalendarCheck, CalendarX } from "lucide-react";

const variantStyles = {
  overdue: "text-red-600 bg-red-50 border border-red-100",
  urgent: "text-orange-600 bg-orange-50 border border-orange-100",
  soon: "text-amber-600 bg-amber-50 border border-amber-100",
  normal: "text-slate-600 bg-slate-50 border border-slate-100",
  paid: "text-emerald-600 bg-emerald-50 border border-emerald-100",
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
  // formatDueDate now returns { label, variant } — unwrap defensively
  const result = formatDueDate(dueDate, status);
  const label = typeof result === "object" && result !== null ? result.label : result;
  const rawVariant = typeof result === "object" && result !== null ? result.variant : null;

  const colorVariant = status === "PAID" ? "paid" : (rawVariant ?? "normal");
  const Icon = variantIcons[colorVariant] ?? CalendarClock;

  if (variant === "text") {
    return (
      <span
        className={cn(
          "text-xs font-medium",
          colorVariant === "overdue"
            ? "text-red-600"
            : colorVariant === "urgent"
            ? "text-orange-600"
            : colorVariant === "paid"
            ? "text-emerald-600"
            : "text-slate-500",
          className
        )}
      >
        {label}
      </span>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <Icon
          size={13}
          className={
            colorVariant === "overdue"
              ? "text-red-500"
              : colorVariant === "urgent"
              ? "text-orange-500"
              : colorVariant === "paid"
              ? "text-emerald-500"
              : "text-slate-400"
          }
        />
        <span
          className={cn(
            "text-sm font-medium",
            colorVariant === "overdue"
              ? "text-red-600"
              : colorVariant === "urgent"
              ? "text-orange-600"
              : colorVariant === "paid"
              ? "text-emerald-600"
              : "text-slate-600"
          )}
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
        "inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5",
        variantStyles[colorVariant],
        className
      )}
    >
      <Icon size={11} className="shrink-0" />
      {label}
    </span>
  );
}