import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

/**
 * useActivity — fetch and manage global activity feed
 *
 * @param {Object} options
 * @param {number} options.limit        — max records to fetch (default 50)
 * @param {string} options.invoiceId    — filter by a specific invoice (optional)
 * @param {boolean} options.autoRefresh — poll for new events every N seconds
 * @param {number} options.refreshInterval — ms between polls (default 30_000)
 */
export function useActivity({
  limit = 50,
  invoiceId = null,
  autoRefresh = false,
  refreshInterval = 30_000,
} = {}) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    hasMore: false,
  });

  const fetchActivities = useCallback(
    async (page = 1, append = false) => {
      try {
        setError(null);
        if (!append) setIsLoading(true);

        const params = { limit, page };
        if (invoiceId) params.invoiceId = invoiceId;

        const endpoint = invoiceId
          ? `/api/invoices/${invoiceId}/activity`
          : "/api/activity";

        const { data } = await api.get(endpoint, { params });

        // Support both { activities, total } and plain array responses
        const items = Array.isArray(data)
          ? data
          : data.activities ?? data.data ?? [];

        const total = data.total ?? items.length;

        setActivities((prev) => (append ? [...prev, ...items] : items));
        setPagination({
          total,
          page,
          hasMore: page * limit < total,
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load activity");
      } finally {
        setIsLoading(false);
      }
    },
    [limit, invoiceId]
  );

  // Initial load
  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchActivities(1), refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  const refresh = useCallback(() => fetchActivities(1), [fetchActivities]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore) {
      fetchActivities(pagination.page + 1, true);
    }
  }, [pagination, fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
  };
}