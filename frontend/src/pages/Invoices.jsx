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
import { useEffect } from "react";

// ─── Stat pill ────────────────────────────────────────────────────────────────
// Colours come exclusively from CSS custom properties so dark-mode toggling
// is handled automatically by the :root / html.dark cascade in globals.css.

const ACCENT_STYLES = {
  slate: {
    background: "var(--color-bg-subtle)",
    color: "var(--color-text-secondary)",
  },
  emerald: {
    background: "var(--color-paid-bg)",
    color: "var(--color-paid-text)",
    borderColor: "color-mix(in srgb, var(--color-paid) 25%, transparent)",
  },
  amber: {
    background: "var(--color-pending-bg)",
    color: "var(--color-pending-text)",
    borderColor: "color-mix(in srgb, var(--color-pending) 25%, transparent)",
  },
  red: {
    background: "var(--color-overdue-bg)",
    color: "var(--color-overdue-text)",
    borderColor: "color-mix(in srgb, var(--color-overdue) 25%, transparent)",
  },
};

function StatPill({ label, value, accent }) {
  const accentStyle = ACCENT_STYLES[accent] ?? ACCENT_STYLES.slate;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
        accent !== "slate" && "border"
      )}
      style={accentStyle}
    >
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
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-0"
          >
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]/50 py-20 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm mb-4">
        <Receipt size={24} className="text-[var(--color-text-muted)]" />
      </span>

      {hasFilters ? (
        <>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
            No invoices match your filters
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            Try adjusting your search or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-xs border-[var(--color-border)] text-[var(--color-text-secondary)]"
          >
            Clear filters
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
            No invoices yet
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            Create your first invoice to get started.
          </p>
          <Button
            asChild
            size="sm"
            className="gap-1.5 text-xs bg-[var(--color-brand)] hover:opacity-90 text-white"
          >
            <Link to="/dashboard/invoices/new">
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
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.title = "Invoices | DueFlow";
  }, []);

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
        <p className="text-sm font-medium text-[var(--color-overdue-text)]">{error}</p>
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
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Invoices
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Manage invoices and track payments.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 gap-1.5 bg-[var(--color-brand)] hover:opacity-90 text-white h-9 px-4 text-sm"
        >
          <Link to="/dashboard/invoices/new">
            <Plus size={14} />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* ── Stats strip ── */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          <StatPill label="total"   value={stats.total}   accent="slate"   />
          <StatPill label="paid"    value={stats.paid}    accent="emerald" />
          <StatPill label="pending" value={stats.pending} accent="amber"   />
          <StatPill label="overdue" value={stats.overdue} accent="red"     />

          {stats.totalUnpaid > 0 && (
            <div
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
              style={{ background: "var(--color-brand)", color: "white" }}
            >
              <span className="text-xs opacity-60">unpaid</span>
              <span className="font-bold tabular-nums">
                {formatCurrency(stats.totalUnpaid)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Filters + view toggle ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <InvoiceFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* View toggle — desktop only */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 shadow-sm">
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              view === "table"
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <LayoutList size={14} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
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
        <p className="text-xs text-[var(--color-text-muted)] text-center pb-2">
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