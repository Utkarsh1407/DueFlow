import { useState } from "react";
import { FileText, Bell, CheckCircle2, AlertTriangle, ArrowRight, Inbox } from "lucide-react";

const ACTIVITY_CONFIG = {
  invoice_created: {
    label: "Invoice created",
    icon: FileText,
    iconBg: "bg-[var(--color-bg-subtle)]",
    iconFg: "text-[var(--color-text-secondary)]",
  },
  reminder_sent: {
    label: "Reminder sent",
    icon: Bell,
    iconBg: "bg-[var(--color-pending-bg)]",
    iconFg: "text-[var(--color-pending-text)]",
  },
  marked_paid: {
    label: "Marked as paid",
    icon: CheckCircle2,
    iconBg: "bg-[var(--color-paid-bg)]",
    iconFg: "text-[var(--color-paid-text)]",
  },
  invoice_overdue: {
    label: "Invoice overdue",
    icon: AlertTriangle,
    iconBg: "bg-[var(--color-overdue-bg)]",
    iconFg: "text-[var(--color-overdue-text)]",
  },
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount);
}

function ActivityItem({ item, isLast }) {
  const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.invoice_created;
  const Icon = cfg.icon;
  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${cfg.iconBg} mt-0.5`}>
          <Icon size={14} className={cfg.iconFg} strokeWidth={2} />
        </div>
        {!isLast && <div className="w-px flex-1 mt-2 mb-1 bg-[var(--color-border)]" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[var(--color-text-primary)] leading-snug"
               style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {cfg.label}
            </p>
            <p className="text-[11.5px] text-[var(--color-text-tertiary)] mt-0.5 truncate max-w-[180px]">
              {item.clientName}
              {item.amount != null && (
                <span className="text-[var(--color-text-muted)]"> · {formatAmount(item.amount)}</span>
              )}
            </p>
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0 mt-0.5 tabular-nums">
            {timeAgo(item.createdAt)}
          </span>
        </div>
        {item.description && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed line-clamp-1">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)] border border-dashed border-[var(--color-border)]">
        <Inbox size={18} className="text-[var(--color-text-muted)]" />
      </div>
      <div className="text-center">
        <p className="text-[12.5px] font-medium text-[var(--color-text-tertiary)]">No activity yet</p>
        <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">
          Actions will appear here as they happen
        </p>
      </div>
    </div>
  );
}

export function RecentActivitySkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-lg bg-[var(--color-bg-subtle)] animate-pulse" />
      </div>
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="h-8 w-8 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse mt-0.5" />
              {i < 4 && <div className="w-px h-10 bg-[var(--color-border)] mt-2 mb-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
                  <div className="h-2.5 w-20 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
                </div>
                <div className="h-2.5 w-10 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "invoice_created", label: "Created" },
  { key: "reminder_sent", label: "Reminders" },
  { key: "marked_paid", label: "Paid" },
  { key: "invoice_overdue", label: "Overdue" },
];

export default function RecentActivity({ activities = [], loading = false, onViewAll, maxItems = 6 }) {
  const [filter, setFilter] = useState("all");
  if (loading) return <RecentActivitySkeleton />;

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);
  const visible = filtered.slice(0, maxItems);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]"
             style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Recent activity
          </p>
          <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">
            {activities.length} event{activities.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-[11.5px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
          >
            View all
            <ArrowRight size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      {activities.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? activities.length : activities.filter((a) => a.type === f.key).length;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150",
                  filter === f.key
                    ? "bg-[var(--color-brand)] text-white"
                    : "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]",
                ].join(" ")}
              >
                {f.label}
                {count > 0 && (
                  <span className="ml-1 text-[var(--color-text-muted)]">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Feed */}
      {visible.length === 0 ? (
        <EmptyActivity />
      ) : (
        <div>
          {visible.map((item, i) => (
            <ActivityItem key={item.id} item={item} isLast={i === visible.length - 1} />
          ))}
        </div>
      )}

      {/* Show more */}
      {filtered.length > maxItems && (
        <button
          onClick={onViewAll}
          className="mt-1 w-full rounded-xl border border-dashed border-[var(--color-border)] py-2.5 text-[11.5px] font-medium text-[var(--color-text-tertiary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-all duration-150"
        >
          +{filtered.length - maxItems} more events
        </button>
      )}
    </div>
  );
}