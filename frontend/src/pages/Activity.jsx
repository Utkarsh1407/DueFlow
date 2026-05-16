import { useState, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Bell,
  Plus,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import ActivityTimeline from "../components/activity/ActivityTimeline";
import { useActivity } from "../hooks/useActivity";
import { cn } from "../lib/utils";
import { useEffect } from "react";

const FILTER_OPTIONS = [
  { value: "ALL",             label: "All Events", icon: Activity },
  { value: "INVOICE_CREATED", label: "Created",    icon: Plus     },
  { value: "INVOICE_UPDATED", label: "Updated",    icon: Edit3    },
  { value: "INVOICE_DELETED", label: "Deleted",    icon: Trash2   },
  { value: "REMINDER_SENT",   label: "Reminders",  icon: Bell     },
];

// Active chip colors — blue/violet kept as-is (no design-system tokens).
// Red → overdue  |  Amber → pending  |  Gray → surface tokens
const FILTER_COLOR = {
  ALL:             "text-[var(--color-text-secondary)] border-[var(--color-border-strong)] bg-[var(--color-bg-hover)]",
  INVOICE_CREATED: "text-blue-600 border-blue-200 bg-blue-50",
  INVOICE_UPDATED: "text-violet-600 border-violet-200 bg-violet-50",
  INVOICE_DELETED: "text-[var(--color-overdue-text)] border-[var(--color-overdue-bg)] bg-[var(--color-overdue-bg)]",
  REMINDER_SENT:   "text-[var(--color-pending-text)] border-[var(--color-pending-bg)] bg-[var(--color-pending-bg)]",
  STATUS_CHANGED:  "text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-bg-subtle)]",
};

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery]   = useState("");

  const { activities, isLoading, error, pagination, refresh, loadMore } =
    useActivity({ limit: 50, autoRefresh: true });

  useEffect(() => {
    document.title = "Activity | DueFlow";
  }, []);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchesType = activeFilter === "ALL" || a.type === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        a.description?.toLowerCase().includes(q) ||
        a.invoice?.clientName?.toLowerCase().includes(q) ||
        a.invoice?.clientEmail?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [activities, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">

      {/* ── Page header ── */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border)] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight">
                  Activity
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {pagination.total > 0
                    ? `${pagination.total} events recorded`
                    : "All system events"}
                </p>
              </div>
            </div>

            <button
              onClick={refresh}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-tertiary)]",
                "hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                "transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, email, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
              "bg-[var(--color-bg-card)] border border-[var(--color-border)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]",
              "focus:outline-none focus:border-[var(--color-border-strong)] focus:ring-1 focus:ring-[var(--color-border)]",
              "transition-all duration-150"
            )}
          />
        </div>

        {/* ── Filter chips ── */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = activeFilter === value;
            return (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                  isActive
                    ? FILTER_COLOR[value]
                    : "text-[var(--color-text-tertiary)] border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-secondary)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Stats bar ── */}
        {!isLoading && activities.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Showing{" "}
              <span className="text-[var(--color-text-primary)] font-medium">{filtered.length}</span>
              {" "}of{" "}
              <span className="text-[var(--color-text-primary)] font-medium">{activities.length}</span>
              {" "}events
            </span>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="rounded-xl border border-[var(--color-overdue-bg)] bg-[var(--color-overdue-bg)] p-4">
            <p className="text-sm text-[var(--color-overdue-text)]">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-xs text-[var(--color-overdue-text)] underline hover:opacity-70"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 sm:p-6 shadow-sm">
          <ActivityTimeline activities={filtered} isLoading={isLoading} />
        </div>

        {/* ── Load more ── */}
        {pagination.hasMore && !isLoading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                "border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-tertiary)]",
                "hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
                "transition-all duration-150"
              )}
            >
              <ChevronDown className="w-4 h-4" />
              Load more events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}