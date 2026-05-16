import { Link } from "react-router-dom";
import { ChevronRight, FilePlus } from "lucide-react";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import { useInvoices } from "@/hooks/useInvoices";
import { useEffect } from "react";

export default function NewInvoice() {
  const { createInvoice } = useInvoices();

  useEffect(() => {
    document.title = "New Invoice | DueFlow";
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/dashboard/invoices" className="hover:text-slate-700 transition-colors">
          Invoices
        </Link>
        <ChevronRight size={12} className="shrink-0" />
        <span className="text-slate-600 font-medium">New Invoice</span>
      </nav>

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
          <FilePlus size={17} className="text-slate-600" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">New Invoice</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fill in the details to create and send a new invoice.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <InvoiceForm onSubmit={createInvoice} isEditing={false} />
    </div>
  );
}