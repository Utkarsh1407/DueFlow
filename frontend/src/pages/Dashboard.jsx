import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Bell,
} from "lucide-react";

import StatCard, { StatCardSkeleton } from "@/components/dashboard/StatCard";
import InvoiceStatusChart, {
  InvoiceStatusChartSkeleton,
} from "@/components/dashboard/InvoiceStatusChart";
import RecentActivity, {
  RecentActivitySkeleton,
} from "@/components/dashboard/RecentActivity";
import QuickActions, {
  QuickActionsSkeleton,
} from "@/components/dashboard/QuickActions";
import PageHeader from "@/components/ui/PageHeader";
import { useDashboard } from "@/hooks/useDashboard";
import { useActivity } from "@/hooks/useActivity";
import { downloadCSV } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

/* ─── Stat card definitions ──────────────────────────────────────────────── */
function buildStatCards(stats) {
  return [
    {
      title: "Total invoices",
      value: stats.total,
      icon: FileText,
      iconColor: "bg-[#F2F2EE]",
      iconFg: "text-[#888880]",
      trend: stats.trends?.total,
    },
    {
      title: "Paid",
      value: stats.paid,
      icon: CheckCircle2,
      iconColor: "bg-[#EDFBF3]",
      iconFg: "text-[#16A34A]",
      trend: stats.trends?.paid,
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      iconColor: "bg-[#FFFBEB]",
      iconFg: "text-[#D97706]",
      trend: stats.trends?.pending,
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      iconColor: "bg-[#FEF1F1]",
      iconFg: "text-[#DC2626]",
      trend: stats.trends?.overdue,
    },
    {
      title: "Unpaid amount",
      value: stats.unpaidAmount,
      icon: IndianRupee,
      iconColor: "bg-[#EEF2FF]",
      iconFg: "text-[#4F46E5]",
      prefix: "₹",
      format: "currency",
    },
    {
      title: "Reminders sent",
      value: stats.remindersSent,
      icon: Bell,
      iconColor: "bg-[#F5F3FF]",
      iconFg: "text-[#7C3AED]",
      trend: stats.trends?.reminders,
    },
  ];
}

/* ─── Greeting ────────────────────────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({ children, className = "" }) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

/* ─── Dashboard page ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, chartData, loading: statsLoading, error: statsError } = useDashboard();
  const { activities, loading: activityLoading } = useActivity({ limit: 10 });

  const isLoading = statsLoading;

  /* Export handler */
  function handleExport() {
    try {
      downloadCSV(); // implement in utils
      toast.success("Export started", {
        description: "Your invoice data is downloading.",
      });
    } catch {
      toast.error("Export failed", {
        description: "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Page header */}
      <PageHeader
        title={`${greeting()} 👋`}
        subtitle="Here's what's happening with your invoices today."
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-12 max-w-screen-xl mx-auto">

        {/* ── Error banner ── */}
        {statsError && (
          <div className="mb-6 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-[12.5px] text-[#B91C1C]">
            Failed to load dashboard data. Please refresh the page.
          </div>
        )}

        {/* ── Stat cards grid ── */}
        <Section className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : buildStatCards(stats ?? {}).map((card) => (
                  <StatCard
                    key={card.title}
                    title={card.title}
                    value={
                      card.format === "currency"
                        ? formatCurrency(card.value ?? 0)
                        : (card.value ?? 0)
                    }
                    prefix={card.format === "currency" ? "" : card.prefix}
                    icon={card.icon}
                    iconColor={card.iconColor}
                    iconFg={card.iconFg}
                    trend={card.trend}
                    onClick={
                      card.title === "Overdue"
                        ? () => navigate("/invoices?status=overdue")
                        : card.title === "Pending"
                        ? () => navigate("/invoices?status=pending")
                        : undefined
                    }
                  />
                ))}
          </div>
        </Section>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Invoice status chart */}
            {isLoading ? (
              <InvoiceStatusChartSkeleton />
            ) : (
              <InvoiceStatusChart
                data={chartData ?? []}
                loading={false}
              />
            )}

            {/* Recent activity */}
            {activityLoading ? (
              <RecentActivitySkeleton />
            ) : (
              <RecentActivity
                activities={activities ?? []}
                loading={false}
                onViewAll={() => navigate("/activity")}
                maxItems={6}
              />
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="flex flex-col gap-5">

            {/* Quick actions */}
            {isLoading ? (
              <QuickActionsSkeleton />
            ) : (
              <QuickActions
                onExport={handleExport}
                overdueCount={stats?.overdue ?? 0}
                pendingReminders={stats?.pending ?? 0}
                loading={false}
              />
            )}

            {/* Overdue callout card — only when there are overdue invoices */}
            {!isLoading && (stats?.overdue ?? 0) > 0 && (
              <div className="rounded-2xl border border-[#FEE2E2] bg-gradient-to-br from-[#FEF2F2] to-[#FFF7F7] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEE2E2] flex-shrink-0">
                    <AlertTriangle size={14} className="text-[#DC2626]" strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className="text-[12.5px] font-semibold text-[#991B1B]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {stats.overdue} overdue invoice{stats.overdue > 1 ? "s" : ""}
                    </p>
                    <p className="text-[11.5px] text-[#B91C1C]/70 mt-0.5 leading-relaxed">
                      These clients haven't paid yet. Send them a reminder to follow up.
                    </p>
                    <button
                      onClick={() => navigate("/invoices?status=overdue")}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#DC2626] px-3 py-1.5 text-[11.5px] font-medium text-white hover:bg-[#B91C1C] transition-colors duration-150"
                    >
                      <Bell size={11} strokeWidth={2} />
                      Send reminders
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* All-clear card — when zero overdue */}
            {!isLoading && (stats?.overdue ?? 0) === 0 && (stats?.total ?? 0) > 0 && (
              <div className="rounded-2xl border border-[#D1FAE5] bg-gradient-to-br from-[#F0FDF4] to-[#F7FFF9] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D1FAE5] flex-shrink-0">
                    <CheckCircle2 size={14} className="text-[#16A34A]" strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className="text-[12.5px] font-semibold text-[#14532D]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      No overdue invoices 🎉
                    </p>
                    <p className="text-[11.5px] text-[#15803D]/70 mt-0.5 leading-relaxed">
                      All your clients are on track. Great work keeping up with follow-ups.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state — no invoices at all */}
            {!isLoading && (stats?.total ?? 0) === 0 && (
              <div className="rounded-2xl border border-dashed border-[#E8E8E4] bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F7F5]">
                  <FileText size={18} className="text-[#AAAA9F]" strokeWidth={1.5} />
                </div>
                <p
                  className="text-[12.5px] font-semibold text-[#111110]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Create your first invoice
                </p>
                <p className="text-[11.5px] text-[#AAAA9F] mt-1 leading-relaxed mb-4">
                  Add clients, set due dates, and start tracking payments.
                </p>
                <button
                  onClick={() => navigate("/invoices/new")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111110] px-4 py-2 text-[12px] font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Get started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}