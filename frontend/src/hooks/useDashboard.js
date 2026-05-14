import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";

/**
 * useDashboard
 *
 * Fetches all data the Dashboard page needs in a single call to GET /api/dashboard.
 *
 * Returns:
 *   stats       — { total, paid, pending, overdue, unpaidAmount, remindersSent, trends }
 *   chartData   — [{ status: "paid"|"pending"|"overdue", count: number }]
 *   loading     — boolean  (true on first fetch)
 *   refreshing  — boolean  (true on background re-fetches)
 *   error       — Error | null
 *   refresh     — () => void  (manually re-fetch)
 *
 * Options:
 *   pollInterval — ms between background polls (default: 0 = off)
 *   autoRefresh  — re-fetch when window regains focus (default: true)
 */
export function useDashboard({
  pollInterval = 0,
  autoRefresh = true,
} = {}) {
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState(null);

  // Track whether the component is still mounted before setting state
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /* ── Core fetch ───────────────────────────────────────────────────────── */
  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!mountedRef.current) return;

    // First load → show full skeleton; subsequent → show subtle "refreshing" state
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data } = await api.get("/dashboard");

      if (!mountedRef.current) return;

      // Normalise stats with safe defaults so the UI never breaks
      const raw = data?.stats ?? {};
      const normalisedStats = {
        total:         raw.total          ?? 0,
        paid:          raw.paid           ?? 0,
        pending:       raw.pending        ?? 0,
        overdue:       raw.overdue        ?? 0,
        unpaidAmount:  raw.unpaidAmount   ?? 0,
        remindersSent: raw.remindersSent  ?? 0,
        trends: {
          total:     raw.trends?.total     ?? null,
          paid:      raw.trends?.paid      ?? null,
          pending:   raw.trends?.pending   ?? null,
          overdue:   raw.trends?.overdue   ?? null,
          reminders: raw.trends?.reminders ?? null,
        },
      };

      // chartData comes from the backend already shaped as
      // [{ status, count }] — fall back to deriving it from stats
      const rawChart = data?.chartData;
      const normalisedChart = Array.isArray(rawChart) && rawChart.length > 0
        ? rawChart
        : [
            { status: "paid",    count: normalisedStats.paid    },
            { status: "pending", count: normalisedStats.pending },
            { status: "overdue", count: normalisedStats.overdue },
          ].filter((d) => d.count > 0);

      setStats(normalisedStats);
      setChartData(normalisedChart);
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("[useDashboard] fetch failed:", err);
      setError(err instanceof Error ? err : new Error("Failed to load dashboard"));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  /* ── Initial load ─────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ── Window-focus refresh ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!autoRefresh) return;

    function onFocus() {
      fetchDashboard({ silent: true });
    }

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [autoRefresh, fetchDashboard]);

  /* ── Polling ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return;

    const id = setInterval(() => {
      fetchDashboard({ silent: true });
    }, pollInterval);

    return () => clearInterval(id);
  }, [pollInterval, fetchDashboard]);

  /* ── Public refresh ───────────────────────────────────────────────────── */
  const refresh = useCallback(() => {
    fetchDashboard({ silent: true });
  }, [fetchDashboard]);

  return { stats, chartData, loading, refreshing, error, refresh };
}

export default useDashboard;