import { useState } from "react";
import {
  FileText,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Inbox,
} from "lucide-react";

/* ─── Activity type config ─────────────────────────────────────────────── */
const ACTIVITY_CONFIG = {
  invoice_created: {
    label: "Invoice created",
    icon: FileText,
    iconBg: "bg-[#EEF2FF]",
    iconFg: "text-[#4F46E5]",
    dot: "bg-[#4F46E5]",
  },
  reminder_sent: {
    label: "Reminder sent",
    icon: Bell,
    iconBg: "bg-[#FFFBEB]",
    iconFg: "text-[#D97706]",
    dot: "bg-[#F59E0B]",
  },
  marked_paid: {
    label: "Marked as paid",
    icon: CheckCircle2,
    iconBg: "bg-[#EDFBF3]",
    iconFg: "text-[#16A34A]",
    dot: "bg-[#22C55E]",
  },
  invoice_overdue: {
    label: "Invoice overdue",
    icon: AlertTriangle,
    iconBg: "bg-[#FEF1F1]",
    iconFg: "text-[#DC2626]",
    dot: "bg-[#EF4444]",
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
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
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─── Individual activity row ────────────────────────────────────────────── */
function ActivityItem({ item, isLast }) {
  const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.invoice_created;
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3 group">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${cfg.iconBg} mt-0.5`}
        >
          <Icon size={14} className={cfg.iconFg} strokeWidth={2} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-2 mb-1 bg-[#F2F2EE]" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className="text-[12.5px] font-medium text-[#111110] leading-snug"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {cfg.label}
            </p>
            <p className="text-[11.5px] text-[#888880] mt-0.5 truncate max-w-[180px]">
              {item.clientName}
              {item.amount != null && (
                <span className="text-[#AAAA9F]">
                  {" "}· {formatAmount(item.amount)}
                </span>
              )}
            </p>
          </div>
          <span className="text-[11px] text-[#AAAA9F] flex-shrink-0 mt-0.5 tabular-nums">
            {timeAgo(item.createdAt)}
          </span>
        </div>
        {item.description && (
          <p className="text-[11px] text-[#AAAA9F] mt-1 leading-relaxed line-clamp-1">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F7F5] border border-dashed border-[#E8E8E4]">
        <Inbox size={18} className="text-[#AAAA9F]" />
      </div>
      <div className="text-center">
        <p className="text-[12.5px] font-medium text-[#888880]">No activity yet</p>
        <p className="text-[11.5px] text-[#AAAA9F] mt-0.5">
          Actions will appear here as they happen
        </p>
      </div>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
export function RecentActivitySkeleton() {
  return (
    <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 rounded-full bg-[#F2F2EE] animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-[#F2F2EE] animate-pulse" />
        </div>
        <div className="h-6 w-16 rounded-lg bg-[#F2F2EE] animate-pulse" />
      </div>
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="h-8 w-8 rounded-xl bg-[#F2F2EE] animate-pulse mt-0.5" />
              {i < 4 && <div className="w-px h-10 bg-[#F2F2EE] mt-2 mb-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 rounded-full bg-[#F2F2EE] animate-pulse" />
                  <div className="h-2.5 w-20 rounded-full bg-[#F2F2EE] animate-pulse" />
                </div>
                <div className="h-2.5 w-10 rounded-full bg-[#F2F2EE] animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Filter tabs ────────────────────────────────────────────────────────── */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "invoice_created", label: "Created" },
  { key: "reminder_sent", label: "Reminders" },
  { key: "marked_paid", label: "Paid" },
  { key: "invoice_overdue", label: "Overdue" },
];

/**
 * RecentActivity
 * Props:
 *   activities  — Activity[]  { id, type, clientName, amount?, description?, createdAt }
 *   loading     — boolean
 *   onViewAll   — function (optional)
 *   maxItems    — number (default 6)
 */
export default function RecentActivity({
  activities = [],
  loading = false,
  onViewAll,
  maxItems = 6,
}) {
  const [filter, setFilter] = useState("all");

  if (loading) return <RecentActivitySkeleton />;

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  const visible = filtered.slice(0, maxItems);

  return (
    <div className="rounded-2xl border border-[#E8E8E4] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-[13px] font-semibold text-[#111110]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Recent activity
          </p>
          <p className="text-[11.5px] text-[#AAAA9F] mt-0.5">
            {activities.length} event{activities.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-[11.5px] font-medium text-[#888880] hover:text-[#111110] transition-colors duration-150"
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
            const count =
              f.key === "all"
                ? activities.length
                : activities.filter((a) => a.type === f.key).length;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150",
                  filter === f.key
                    ? "bg-[#111110] text-white"
                    : "bg-[#F2F2EE] text-[#888880] hover:text-[#111110]",
                ].join(" ")}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={`ml-1 ${
                      filter === f.key ? "text-[#AAAA9F]" : "text-[#AAAA9F]"
                    }`}
                  >
                    {count}
                  </span>
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
            <ActivityItem
              key={item.id}
              item={item}
              isLast={i === visible.length - 1}
            />
          ))}
        </div>
      )}

      {/* Show more */}
      {filtered.length > maxItems && (
        <button
          onClick={onViewAll}
          className="mt-1 w-full rounded-xl border border-dashed border-[#E8E8E4] py-2.5 text-[11.5px] font-medium text-[#888880] hover:border-[#C8C8C0] hover:text-[#111110] transition-all duration-150"
        >
          +{filtered.length - maxItems} more events
        </button>
      )}
    </div>
  );
}