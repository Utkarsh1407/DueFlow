import { useMemo, useState } from "react";
import { Plus, LayoutGrid, Table2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import InvoiceTable from "../components/invoices/InvoiceTable";
import InvoiceCard from "../components/invoices/InvoiceCard";
import InvoiceForm from "../components/invoices/InvoiceForm";
import StatusBadge from "../components/invoices/StatusBadge";
import DueDateLabel from "../components/invoices/DueDateLabel";
import InvoiceFilters from "../components/invoices/InvoiceFilters";
import DeleteDialog from "../components/invoices/DeleteDialog";

export default function Invoices() {
  const navigate = useNavigate();

  const [view, setView] = useState("table");

  const [filters, setFilters] = useState({
    search: "",
    statuses: [],
    sortBy: "createdAt_desc",
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices, setInvoices] = useState([
    {
      id: "INV-1001",
      clientName: "Acme Corporation",
      clientEmail: "billing@acme.com",
      amount: 12500,
      dueDate: "2026-05-18",
      createdAt: "2026-05-01",
      status: "PENDING",
      notes: "Website redesign payment",
      _count: {
        reminders: 2,
      },
    },
    {
      id: "INV-1002",
      clientName: "Nova Studio",
      clientEmail: "finance@nova.com",
      amount: 8400,
      dueDate: "2026-05-08",
      createdAt: "2026-04-22",
      status: "OVERDUE",
      notes: "Mobile app UI payment",
      _count: {
        reminders: 5,
      },
    },
    {
      id: "INV-1003",
      clientName: "Pixel Labs",
      clientEmail: "hello@pixel.com",
      amount: 22000,
      dueDate: "2026-05-28",
      createdAt: "2026-05-04",
      status: "PAID",
      notes: "Backend development",
      _count: {
        reminders: 0,
      },
    },
  ]);

  // FILTER + SORT
  const filteredInvoices = useMemo(() => {
    let data = [...invoices];

    // SEARCH
    if (filters.search) {
      const q = filters.search.toLowerCase();

      data = data.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientEmail.toLowerCase().includes(q)
      );
    }

    // STATUS FILTER
    if (filters.statuses?.length > 0) {
      data = data.filter((inv) =>
        filters.statuses.includes(inv.status)
      );
    }

    // SORT
    const [field, dir] = filters.sortBy.split("_");

    data.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === "amount") {
        return dir === "asc"
          ? valA - valB
          : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (dir === "asc") {
        return valA > valB ? 1 : -1;
      }

      return valA < valB ? 1 : -1;
    });

    return data;
  }, [filters, invoices]);

  // CREATE INVOICE
  async function handleCreateInvoice(data) {
    const newInvoice = {
      id: `INV-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      _count: {
        reminders: 0,
      },
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  }

  // DELETE
  async function handleDelete(id) {
    setInvoices((prev) =>
      prev.filter((invoice) => invoice.id !== id)
    );
  }

  // REMINDER
  async function handleRemind(invoiceId) {
    console.log("Reminder sent:", invoiceId);
  }

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage invoices, reminders, statuses, and payments.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* VIEW TOGGLE */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setView("table")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                view === "table"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Table2 size={16} />
            </button>

            <button
              onClick={() => setView("grid")}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                view === "grid"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={() => navigate("/invoices/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Plus size={16} />
            New Invoice
          </button>
        </div>
      </div>

      {/* STATUS BADGES DEMO */}
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="PAID" />
        <StatusBadge status="PENDING" />
        <StatusBadge status="OVERDUE" />
      </div>

      {/* DUE DATE LABELS DEMO */}
      <div className="flex flex-wrap gap-3">
        <DueDateLabel
          dueDate="2026-05-08"
          status="OVERDUE"
        />

        <DueDateLabel
          dueDate="2026-05-18"
          status="PENDING"
        />

        <DueDateLabel
          dueDate="2026-05-28"
          status="PAID"
        />
      </div>

      {/* FILTERS */}
      <InvoiceFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* MOBILE CARD VIEW */}
      <div className="grid gap-4 sm:hidden">
        {filteredInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onDelete={(invoice) => {
              setSelectedInvoice(invoice);
              setDeleteOpen(true);
            }}
            onRemind={handleRemind}
          />
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block">
        {view === "table" ? (
          <InvoiceTable
            invoices={filteredInvoices}
            loading={false}
            sortBy={filters.sortBy}
            onSortChange={(sortBy) =>
              setFilters((prev) => ({
                ...prev,
                sortBy,
              }))
            }
            onDelete={(invoice) => {
              setSelectedInvoice(invoice);
              setDeleteOpen(true);
            }}
            onRemind={handleRemind}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onDelete={(invoice) => {
                  setSelectedInvoice(invoice);
                  setDeleteOpen(true);
                }}
                onRemind={handleRemind}
              />
            ))}
          </div>
        )}
      </div>

      {/* INVOICE FORM */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">
          Create Invoice
        </h2>

        <InvoiceForm
          onSubmit={handleCreateInvoice}
        />
      </div>

      {/* DELETE DIALOG */}
      {selectedInvoice && (
        <DeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          invoice={selectedInvoice}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}