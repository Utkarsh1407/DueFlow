import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

/**
 * useInvoices
 *
 * Manages the full invoice list with:
 *  - server-side fetching
 *  - client-side search / status filter / sort (avoids round-trips on every keystroke)
 *  - CRUD mutations (create, update, delete)
 *  - send reminder
 *  - optimistic UI updates
 *
 * @returns {object} invoices state + action handlers
 */
export function useInvoices() {
  // ─── Raw data from server ─────────────────────────────────────────────────
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Filter / sort state ──────────────────────────────────────────────────
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const status = searchParams.get("status");
    return {
      search: "",
      statuses: status ? [status.toUpperCase()] : [],
      sortBy: "createdAt_desc",
    };
  });

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/invoices");
      console.log("RAW API RESPONSE:", data);
      const invoices = data.data?.invoices ?? data.invoices ?? data;
      setAllInvoices(Array.isArray(invoices) ? invoices : []);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to load invoices.";
      setError(msg);
      toast.error("Could not load invoices", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ─── Client-side derived list ─────────────────────────────────────────────

  const invoices = useMemo(() => {
    let list = [...allInvoices];

    // Search
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientEmail.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      list = list.filter((inv) => filters.statuses.includes(inv.status));
    }

    // Sort
    const [field, dir] = filters.sortBy.split("_");
    const multiplier = dir === "asc" ? 1 : -1;

    list.sort((a, b) => {
      if (field === "amount") {
        return (Number(a.amount) - Number(b.amount)) * multiplier;
      }
      if (field === "dueDate" || field === "createdAt") {
        return (
          (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * multiplier
        );
      }
      // clientName fallback
      return a.clientName.localeCompare(b.clientName) * multiplier;
    });

    return list;
  }, [allInvoices, filters]);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = allInvoices.length;
    const paid = allInvoices.filter((i) => i.status === "PAID").length;
    const pending = allInvoices.filter((i) => i.status === "PENDING").length;
    const overdue = allInvoices.filter((i) => i.status === "OVERDUE").length;
    const totalUnpaid = allInvoices
      .filter((i) => i.status !== "PAID")
      .reduce((sum, i) => sum + Number(i.amount), 0);
    return { total, paid, pending, overdue, totalUnpaid };
  }, [allInvoices]);

  // ─── Mutations ────────────────────────────────────────────────────────────

  /** Create a new invoice and add it optimistically */
  const createInvoice = useCallback(async (payload) => {
    const { data } = await api.post("/invoices", payload);
    const created = data.invoice ?? data;
    setAllInvoices((prev) => [created, ...prev]);
    return created;
  }, []);

  /** Update an invoice in place */
  const updateInvoice = useCallback(async (id, payload) => {
    const { data } = await api.put(`/invoices/${id}`, payload);
    const updated = data.invoice ?? data;
    setAllInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? updated : inv))
    );
    return updated;
  }, []);

  /** Delete an invoice with optimistic removal + rollback on error */
  const deleteInvoice = useCallback(async (id) => {
    let snapshot;
    setAllInvoices((prev) => {
      snapshot = prev.find((i) => i.id === id);
      return prev.filter((inv) => inv.id !== id);
    });
    try {
      await api.delete(`/invoices/${id}`);
    } catch (err) {
      // rollback
      if (snapshot) setAllInvoices((prev) => [snapshot, ...prev]);
      throw err;
    }
  }, []);

  /** Send a payment reminder email */
  const sendReminder = useCallback(async (id) => {
    const { data } = await api.post(`/reminders/${id}/send`);
    // bump reminder count in local state
    setAllInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              _count: {
                ...inv._count,
                reminders: (inv._count?.reminders ?? 0) + 1,
              },
            }
          : inv
      )
    );
    toast.success("Reminder sent", {
      description: data?.message ?? "Payment reminder email delivered.",
    });
    return data;
  }, []);

  /** Mark an invoice as paid without opening edit form */
  const markPaid = useCallback(async (id) => {
    const { data } = await api.patch(`/invoices/${id}/status`, { status: "PAID" });
    const updated = data.invoice ?? data;
    setAllInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? updated : inv))
    );
    toast.success("Invoice marked as paid");
    return updated;
  }, []);

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    // list state
    invoices,
    allInvoices,
    loading,
    error,
    stats,

    // filter state
    filters,
    setFilters,

    // actions
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendReminder,
    markPaid,
  };
}