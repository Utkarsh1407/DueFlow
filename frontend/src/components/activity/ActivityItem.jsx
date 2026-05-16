import { 
  FileText, 
  Bell, 
  Clock,
  Trash2,
  Edit3,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Blue and violet have no equivalent design tokens — kept as Tailwind semantics.
// Red  → overdue tokens  |  Amber → pending tokens  |  Gray → surface/text tokens
const ACTIVITY_CONFIG = {
  INVOICE_CREATED: {
    icon: Plus,
    label: "Invoice Created",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  INVOICE_UPDATED: {
    icon: Edit3,
    label: "Invoice Updated",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    dot: "bg-violet-500",
  },
  INVOICE_DELETED: {
    icon: Trash2,
    label: "Invoice Deleted",
    color: "text-[var(--color-overdue-text)]",
    bg: "bg-[var(--color-overdue-bg)]",
    border: "border-[var(--color-overdue-bg)]",
    dot: "bg-[var(--color-overdue)]",
  },
  REMINDER_SENT: {
    icon: Bell,
    label: "Reminder Sent",
    color: "text-[var(--color-pending-text)]",
    bg: "bg-[var(--color-pending-bg)]",
    border: "border-[var(--color-pending-bg)]",
    dot: "bg-[var(--color-pending)]",
  },
  STATUS_CHANGED: {
    icon: Clock,
    label: "Status Changed",
    color: "text-[var(--color-text-tertiary)]",
    bg: "bg-[var(--color-bg-subtle)]",
    border: "border-[var(--color-border)]",
    dot: "bg-[var(--color-text-muted)]",
  },
};

const DEFAULT_CONFIG = {
  icon: FileText,
  label: "Activity",
  color: "text-[var(--color-text-tertiary)]",
  bg: "bg-[var(--color-bg-subtle)]",
  border: "border-[var(--color-border)]",
  dot: "bg-[var(--color-text-muted)]",
};

export default function ActivityItem({ activity, isLast = false, index = 0 }) {
  const config = ACTIVITY_CONFIG[activity.type] || DEFAULT_CONFIG;
  const Icon = config.icon;

  const timeAgo = activity.createdAt
    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
    : "just now";

  return (
    <div
      className="relative flex gap-4 group"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: "fadeSlideIn 0.4s ease both",
      }}
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-[var(--color-border)] to-transparent" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 flex-shrink-0 mt-0.5">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            border ${config.bg} ${config.border}
            transition-all duration-200
            group-hover:scale-110 group-hover:shadow-sm
          `}
        >
          <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div
          className={`
            rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]
            px-4 py-3 shadow-sm
            transition-all duration-200
            group-hover:border-[var(--color-border-strong)] group-hover:shadow-md
          `}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold tracking-wide uppercase ${config.color}`}
              >
                {config.label}
              </span>
              {activity.invoice && (
                <>
                  <span className="text-[var(--color-border-strong)] text-xs">·</span>
                  <span className="text-xs text-[var(--color-text-tertiary)] font-medium truncate max-w-[180px]">
                    {activity.invoice.clientName}
                  </span>
                </>
              )}
            </div>
            <time className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap font-mono tracking-tight flex-shrink-0">
              {timeAgo}
            </time>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Invoice pill */}
          {activity.invoice && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-2.5 py-1">
                <FileText className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
                  {activity.invoice.clientEmail || "Invoice"}
                </span>
                {activity.invoice.amount != null && (
                  <>
                    <span className="text-[var(--color-border-strong)]">·</span>
                    <span className="text-[11px] font-semibold text-[var(--color-text-primary)]">
                      ₹{Number(activity.invoice.amount).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}