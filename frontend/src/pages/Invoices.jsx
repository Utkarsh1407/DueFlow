import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, LayoutList, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";
import DeleteDialog from "@/components/invoices/DeleteDialog";
import { useInvoices } from "@/hooks/useInvoices";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, accent }) {
  const accents = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    red: "bg-red-50 text-red-700 border border-red-100",
  };
  return (
    <div className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm", accents[accent])}>
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 last:border-0">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyInvoices({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-20 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
        <Receipt size={24} className="text-slate-400" />
      </span>
      {hasFilters ? (
        <>
          <p className="text-sm font-semibold text-slate-700 mb-1">No invoices match your filters</p>
          <p className="text-xs text-slate-400 mb-4">Try adjusting your search or filter criteria.</p>
          <Button variant="outline" size="sm" onClick={onClear} className="text-xs border-slate-200">
            Clear filters
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-700 mb-1">No invoices yet</p>
          <p className="text-xs text-slate-400 mb-4">Create your first invoice to get started.</p>
          <Button asChild size="sm" className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-700 text-white">
            <Link to="/invoices/new">
              <Plus size={13} />
              New Invoice
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Invoices() {
  const {
    invoices,
    loading,
    error,
    stats,
    filters,
    setFilters,
    deleteInvoice,
    sendReminder,
  } = useInvoices();

  const [view, setView] = useState("table"); // "table" | "grid"
  const [deleteTarget, setDeleteTarget] = useState(null); // invoice object

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.statuses.length > 0 ||
    filters.sortBy !== "createdAt_desc";

  function clearFilters() {
    setFilters({ search: "", statuses: [], sortBy: "createdAt_desc" });
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage invoices and track payments.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 bg-slate-900 hover:bg-slate-700 text-white h-9 px-4 text-sm"
        >
          <Link to="/invoices/new">
            <Plus size={14} />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* ── Stats strip ── */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          <StatPill label="total" value={stats.total} accent="slate" />
          <StatPill label="paid" value={stats.paid} accent="emerald" />
          <StatPill label="pending" value={stats.pending} accent="amber" />
          <StatPill label="overdue" value={stats.overdue} accent="red" />
          {stats.totalUnpaid > 0 && (
            <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm">
              <span className="text-xs opacity-60">unpaid</span>
              <span className="font-bold tabular-nums">{formatCurrency(stats.totalUnpaid)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Filters + view toggle ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <InvoiceFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* View toggle (desktop only) */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              view === "table"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            <LayoutList size={14} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <PageSkeleton />
      ) : invoices.length === 0 ? (
        <EmptyInvoices hasFilters={hasFilters} onClear={clearFilters} />
      ) : view === "grid" ? (
        // Grid / card view
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onDelete={(inv) => setDeleteTarget(inv)}
              onRemind={sendReminder}
            />
          ))}
        </div>
      ) : (
        // Table view
        <InvoiceTable
          invoices={invoices}
          loading={false}
          sortBy={filters.sortBy}
          onSortChange={(sortBy) => setFilters((f) => ({ ...f, sortBy }))}
          onDelete={(inv) => setDeleteTarget(inv)}
          onRemind={sendReminder}
        />
      )}

      {/* ── Result count ── */}
      {!loading && invoices.length > 0 && (
        <p className="text-xs text-slate-400 text-center pb-2">
          Showing {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          {hasFilters ? " — filtered" : ""}
        </p>
      )}

      {/* ── Delete confirmation dialog ── */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        invoice={deleteTarget}
        onConfirm={deleteInvoice}
      />
    </div>
  );
}