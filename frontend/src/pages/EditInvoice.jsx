import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, FilePen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoiceDetail } from "@/hooks/useInvoiceDetail";
import { useEffect } from "react";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6 space-y-4 shadow-sm"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-card)",
            }}
          >
            <Skeleton className="h-4 w-36" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div
          className="rounded-xl p-5 space-y-3 shadow-sm"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
        <div
          className="rounded-xl p-5 space-y-2 shadow-sm"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function EditError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--color-overdue-bg)",
          border: "1px solid var(--color-overdue-bg)",
        }}
      >
        <AlertTriangle size={20} style={{ color: "var(--color-overdue)" }} />
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {message ?? "Invoice not found"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          The invoice may have been deleted or the link is invalid.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          Go back
        </Button>
        <Button
          asChild
          size="sm"
          className="text-xs"
          style={{
            backgroundColor: "var(--color-brand)",
            color: "var(--color-bg-card)",
          }}
        >
          <Link to="/dashboard/invoices">All Invoices</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditInvoice() {
  const { id } = useParams();
  const { invoice, loading, error, updateInvoice } = useInvoiceDetail(id);
  useEffect(() => {
    document.title = invoice ? `Edit — ${invoice.clientName}` : "Edit Invoice";
  }, [invoice]);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
        <Link
          to="/dashboard/invoices"
          className="transition-colors hover:underline"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.target.style.color = "var(--color-text-primary)")}
          onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted)")}
        >
          Invoices
        </Link>
        <ChevronRight size={12} className="shrink-0" />
        {invoice ? (
          <>
            <Link
              to={`/dashboard/invoices/${id}`}
              className="transition-colors max-w-[140px] truncate"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--color-text-muted)")}
            >
              {invoice.clientName}
            </Link>
            <ChevronRight size={12} className="shrink-0" />
          </>
        ) : (
          <>
            <Skeleton className="h-3 w-24 inline-block" />
            <ChevronRight size={12} className="shrink-0" />
          </>
        )}
        <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Edit
        </span>
      </nav>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
          }}
        >
          <FilePen size={17} style={{ color: "var(--color-text-secondary)" }} />
        </span>
        <div className="min-w-0">
          <h1
            className="text-xl font-bold tracking-tight truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {loading ? (
              <Skeleton className="h-6 w-48 inline-block" />
            ) : invoice ? (
              `Edit — ${invoice.clientName}`
            ) : (
              "Edit Invoice"
            )}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Update invoice details. Changes take effect immediately.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <EditSkeleton />
      ) : error ? (
        <EditError message={error} />
      ) : (
        <InvoiceForm
          defaultValues={invoice}
          onSubmit={(data) => updateInvoice(data)}
          isEditing
        />
      )}
    </div>
  );
}