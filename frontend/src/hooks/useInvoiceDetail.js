import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

/**
 * useInvoiceDetail
 *
 * Loads a single invoice with:
 *  - full invoice data
 *  - reminder history
 *  - activity timeline
 *  - send reminder (with cooldown enforcement)
 *  - mark paid shortcut
 *  - delete
 *
 * @param {string} id - invoice UUID
 */
export function useInvoiceDetail(id) {
  const [invoice, setInvoice]       = useState(null);
  const [reminders, setReminders]   = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [reminding, setReminding]   = useState(false);

  // ─── Fetch full detail ────────────────────────────────────────────────────

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [invoiceRes, reminderRes, activityRes] = await Promise.all([
        api.get(`/invoices/${id}`),
        api.get(`/invoices/${id}/reminders`),
        api.get(`/invoices/${id}/activity`),
      ]);

      setInvoice(invoiceRes.data.invoice ?? invoiceRes.data);
      setReminders(reminderRes.data.reminders ?? reminderRes.data ?? []);
      setActivities(activityRes.data.activities ?? activityRes.data ?? []);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to load invoice.";
      setError(msg);
      // 404 check
      if (err?.response?.status === 404) {
        setError("Invoice not found.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ─── Cooldown guard ───────────────────────────────────────────────────────

  /** Returns true if a reminder was sent within the last 24 hours */
  const isOnCooldown = useCallback(() => {
    if (reminders.length === 0) return false;
    const latest = new Date(reminders[0].sentAt);
    const diffHours = (Date.now() - latest.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }, [reminders]);

  const cooldownRemainingHours = useCallback(() => {
    if (reminders.length === 0) return 0;
    const latest = new Date(reminders[0].sentAt);
    const diffHours = (Date.now() - latest.getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.ceil(24 - diffHours));
  }, [reminders]);

  // ─── Send reminder ────────────────────────────────────────────────────────

  const sendReminder = useCallback(async ({ force = false } = {}) => {
    if (!force && isOnCooldown()) {
      toast.warning("Reminder cooldown active", {
        description: `Next reminder can be sent in ~${cooldownRemainingHours()} hour(s).`,
      });
      return null;
    }

    if (invoice?.status === "PAID") {
      toast.info("Invoice already paid", {
        description: "No reminder needed for a paid invoice.",
      });
      return null;
    }

    try {
      setReminding(true);
      const { data } = await api.post(`/invoices/${id}/remind`);
      const newReminder = data.reminder ?? { sentAt: new Date().toISOString(), id: Date.now() };

      setReminders((prev) => [newReminder, ...prev]);

      // Append activity
      const newActivity = {
        id: `tmp-${Date.now()}`,
        type: "REMINDER_SENT",
        description: "Payment reminder email sent.",
        createdAt: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);

      toast.success("Reminder sent", {
        description: data?.message ?? "Payment reminder delivered successfully.",
      });

      return data;
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to send reminder.";

      // Handle server-side cooldown rejection (429)
      if (err?.response?.status === 429) {
        toast.warning("Too many reminders", { description: msg });
      } else {
        toast.error("Reminder failed", { description: msg });
      }

      throw err;
    } finally {
      setReminding(false);
    }
  }, [id, invoice, isOnCooldown, cooldownRemainingHours]);

  // ─── Mark paid ────────────────────────────────────────────────────────────

  const markPaid = useCallback(async () => {
    try {
      const { data } = await api.patch(`/invoices/${id}/status`, { status: "PAID" });
      const updated = data.invoice ?? data;
      setInvoice(updated);

      const newActivity = {
        id: `tmp-${Date.now()}`,
        type: "MARKED_PAID",
        description: "Invoice marked as paid.",
        createdAt: new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);

      toast.success("Invoice marked as paid", {
        description: "Great — this invoice is now settled.",
      });
      return updated;
    } catch (err) {
      toast.error("Could not update status", {
        description: err?.response?.data?.message ?? "Please try again.",
      });
      throw err;
    }
  }, [id]);

  // ─── Update invoice ───────────────────────────────────────────────────────

  const updateInvoice = useCallback(async (payload) => {
    const { data } = await api.put(`/invoices/${id}`, payload);
    const updated = data.invoice ?? data;
    setInvoice(updated);
    return updated;
  }, [id]);

  // ─── Delete invoice ───────────────────────────────────────────────────────

  const deleteInvoice = useCallback(async () => {
    await api.delete(`/invoices/${id}`);
  }, [id]);

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    // state
    invoice,
    reminders,
    activities,
    loading,
    error,
    reminding,

    // computed
    isOnCooldown,
    cooldownRemainingHours,
    reminderCount: reminders.length,

    // actions
    fetchDetail,
    sendReminder,
    markPaid,
    updateInvoice,
    deleteInvoice,
  };
}