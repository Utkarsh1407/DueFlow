import { useState, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Clock,
} from "lucide-react";
import ActivityTimeline from "../components/activity/ActivityTimeline";
import { useActivity } from "../hooks/useActivity";
import { cn } from "../lib/utils";

const FILTER_OPTIONS = [
  { value: "ALL", label: "All Events", icon: Activity },
  { value: "INVOICE_CREATED", label: "Created", icon: Plus },
  { value: "INVOICE_UPDATED", label: "Updated", icon: Edit3 },
  { value: "INVOICE_DELETED", label: "Deleted", icon: Trash2 },
  { value: "REMINDER_SENT", label: "Reminders", icon: Bell },
  { value: "MARKED_PAID", label: "Paid", icon: CheckCircle2 },
  { value: "OVERDUE_DETECTED", label: "Overdue", icon: AlertTriangle },
];

const FILTER_COLOR = {
  ALL: "text-slate-400 border-slate-700/60 bg-slate-800/40",
  INVOICE_CREATED: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  INVOICE_UPDATED: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  INVOICE_DELETED: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  REMINDER_SENT: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  MARKED_PAID: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  OVERDUE_DETECTED: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  STATUS_CHANGED: "text-slate-400 border-slate-400/30 bg-slate-400/10",
};

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { activities, isLoading, error, pagination, refresh, loadMore } =
    useActivity({ limit: 50, autoRefresh: true });

  // Client-side filter + search
  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchesType =
        activeFilter === "ALL" || a.type === activeFilter;
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
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* ── Page header ── */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-100 leading-tight">
                  Activity
                </h1>
                <p className="text-xs text-slate-500">
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
                "border border-slate-700/60 bg-slate-800/60 text-slate-400",
                "hover:text-slate-200 hover:border-slate-600 transition-all duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, email, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
              "bg-slate-900/50 border border-slate-800/80 text-slate-300 placeholder-slate-600",
              "focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600/30",
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
                    : "text-slate-500 border-slate-800/60 bg-transparent hover:border-slate-700 hover:text-slate-400"
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
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Showing{" "}
              <span className="text-slate-300 font-medium">{filtered.length}</span>{" "}
              of{" "}
              <span className="text-slate-300 font-medium">{activities.length}</span>{" "}
              events
            </span>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <p className="text-sm text-rose-400">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-xs text-rose-400 underline hover:text-rose-300"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 sm:p-6">
          <ActivityTimeline activities={filtered} isLoading={isLoading} />
        </div>

        {/* ── Load more ── */}
        {pagination.hasMore && !isLoading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                "border border-slate-700/60 bg-slate-800/40 text-slate-400",
                "hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/70",
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