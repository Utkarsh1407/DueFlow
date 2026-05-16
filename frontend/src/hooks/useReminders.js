import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import api from "../lib/api";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * useReminders
 * Manages reminder state, sending logic, cooldown enforcement,
 * and history fetching for a given invoice.
 */
export function useReminders(invoiceId) {
  const [reminders, setReminders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);

  // ─── Fetch reminder history for this invoice ───────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (!invoiceId) return;
    setLoadingHistory(true);
    try {
      // ✅ Fix 2: corrected path to match server route /:invoiceId/history
      const { data } = await api.get(`/reminders/${invoiceId}/history`);
      setReminders(data.data?.reminders ?? data.reminders ?? []);

      // Rehydrate cooldown from latest reminder
      if (data.reminders?.length > 0) {
        const latest = new Date(data.reminders[0].sentAt).getTime();
        const until = latest + COOLDOWN_MS;
        if (until > Date.now()) {
          setCooldownUntil(new Date(until));
        } else {
          setCooldownUntil(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reminder history:", err);
      toast.error("Could not load reminder history.");
    } finally {
      setLoadingHistory(false);
    }
  }, [invoiceId]);

  // ✅ Fix 1: auto-fetch when the hook mounts or invoiceId changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ─── Send a reminder ────────────────────────────────────────────────────────
  const sendReminder = useCallback(async () => {
    if (!invoiceId) return;

    // Client-side cooldown guard
    if (cooldownUntil && new Date() < cooldownUntil) {
      toast.warning("Reminder already sent recently. Please wait before sending again.");
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post(`/reminders/${invoiceId}/send`);

      // Prepend new reminder to local list
      const newReminder = data.data?.reminder ?? data.reminder;
      setReminders((prev) => [newReminder, ...prev]);

      // Set new cooldown
      const until = new Date(Date.now() + COOLDOWN_MS);
      setCooldownUntil(until);

      toast.success("Reminder sent successfully!", {
        description: `Email delivered to ${data.reminder?.clientEmail ?? "client"}.`,
      });
    } catch (err) {
      const message =
        err?.response?.data?.error ?? "Failed to send reminder. Please try again.";

      if (err?.response?.status === 429) {
        // Server-side cooldown response
        const retryAfter = err?.response?.data?.retryAfter;
        if (retryAfter) setCooldownUntil(new Date(retryAfter));
        toast.warning("Reminder cooldown active.", {
          description: "You can only send one reminder per 24 hours per invoice.",
        });
      } else {
        toast.error(message);
      }
    } finally {
      setSending(false);
    }
  }, [invoiceId, cooldownUntil]);

  // ─── Derived helpers ────────────────────────────────────────────────────────
  const isOnCooldown = Boolean(cooldownUntil && new Date() < cooldownUntil);
  const reminderCount = reminders.length;
  const lastSentAt = reminders[0]?.sentAt ?? null;

  return {
    reminders,
    loadingHistory,
    sending,
    cooldownUntil,
    isOnCooldown,
    reminderCount,
    lastSentAt,
    sendReminder,
    fetchHistory,
  };
}