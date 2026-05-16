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

const FILTER_OPTIONS = [
  { value: "ALL", label: "All Events", icon: Activity },
  { value: "INVOICE_CREATED", label: "Created", icon: Plus },
  { value: "INVOICE_UPDATED", label: "Updated", icon: Edit3 },
  { value: "INVOICE_DELETED", label: "Deleted", icon: Trash2 },
  { value: "REMINDER_SENT", label: "Reminders", icon: Bell },
];

const FILTER_COLOR = {
  ALL: "text-gray-700 border-gray-300 bg-gray-100",
  INVOICE_CREATED: "text-blue-600 border-blue-200 bg-blue-50",
  INVOICE_UPDATED: "text-violet-600 border-violet-200 bg-violet-50",
  INVOICE_DELETED: "text-red-600 border-red-200 bg-red-50",
  REMINDER_SENT: "text-amber-600 border-amber-200 bg-amber-50",
  STATUS_CHANGED: "text-gray-600 border-gray-200 bg-gray-50",
};

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { activities, isLoading, error, pagination, refresh, loadMore } =
    useActivity({ limit: 50, autoRefresh: true });

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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ── Page header ── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 leading-tight">
                  Activity
                </h1>
                <p className="text-xs text-gray-400">
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
                "border border-gray-200 bg-white text-gray-500",
                "hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150",
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client name, email, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm",
              "bg-white border border-gray-200 text-gray-800 placeholder-gray-400",
              "focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300",
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
                    : "text-gray-500 border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700"
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
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Showing{" "}
              <span className="text-gray-700 font-medium">{filtered.length}</span>{" "}
              of{" "}
              <span className="text-gray-700 font-medium">{activities.length}</span>{" "}
              events
            </span>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-xs text-red-500 underline hover:text-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
          <ActivityTimeline activities={filtered} isLoading={isLoading} />
        </div>

        {/* ── Load more ── */}
        {pagination.hasMore && !isLoading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium",
                "border border-gray-200 bg-white text-gray-500",
                "hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50",
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