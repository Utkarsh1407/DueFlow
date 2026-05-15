import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight, FilePen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoiceDetail } from "@/hooks/useInvoiceDetail";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <Skeleton className="h-4 w-36" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
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
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <AlertTriangle size={20} className="text-red-500" />
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">{message ?? "Invoice not found"}</p>
        <p className="text-xs text-slate-400 mt-1">
          The invoice may have been deleted or the link is invalid.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-slate-200 text-slate-600 text-xs">
          Go back
        </Button>
        <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-700 text-white text-xs">
          <Link to="/invoices">All Invoices</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditInvoice() {
  const { id } = useParams();
  const { invoice, loading, error, updateInvoice } = useInvoiceDetail(id);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/invoices" className="hover:text-slate-700 transition-colors">
          Invoices
        </Link>
        <ChevronRight size={12} className="shrink-0" />
        {invoice ? (
          <>
            <Link
              to={`/invoices/${id}`}
              className="hover:text-slate-700 transition-colors max-w-[140px] truncate"
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
        <span className="text-slate-600 font-medium">Edit</span>
      </nav>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 shrink-0">
          <FilePen size={17} className="text-slate-600" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
            {loading ? (
              <Skeleton className="h-6 w-48 inline-block" />
            ) : invoice ? (
              `Edit — ${invoice.clientName}`
            ) : (
              "Edit Invoice"
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
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