import axios from "axios";
import { toast } from "sonner";

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // Attach auth token if present (future-proofing for auth layer)
    const token = localStorage.getItem("df_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Strip undefined/null params so they don't pollute query strings
    if (config.params) {
      config.params = Object.fromEntries(
        Object.entries(config.params).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response.data,           // unwrap { data } envelope by default
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    // Map status codes to user-friendly messages
    const fallbackMessages = {
      400: "Invalid request. Please check your inputs.",
      401: "You need to log in to continue.",
      403: "You don't have permission to do that.",
      404: "The requested resource was not found.",
      409: "A conflict occurred — this resource may already exist.",
      422: "Validation failed. Please review your inputs.",
      429: "Too many requests. Please slow down.",
      500: "Server error. Please try again in a moment.",
      503: "Service unavailable. We'll be back shortly.",
    };

    const message =
      serverMessage ||
      fallbackMessages[status] ||
      "An unexpected error occurred.";

    // Auto-toast for server errors — suppress for silent calls via config flag
    if (!error.config?.silent) {
      if (status >= 500) {
        toast.error("Server Error", { description: message });
      } else if (status === 401) {
        toast.warning("Session Expired", { description: message });
        // Optionally redirect: window.location.href = "/login";
      }
    }

    // Normalize error shape for consistent handling in hooks
    const normalized = {
      status,
      message,
      errors: error.response?.data?.errors || [],        // field-level errors
      raw: error,
    };

    return Promise.reject(normalized);
  }
);

// ─── Typed Resource Helpers ───────────────────────────────────────────────────
// These thin wrappers allow callers to opt into silent mode or add per-call
// config without repeating boilerplate.

export const apiGet = (url, params = {}, config = {}) =>
  api.get(url, { params, ...config });

export const apiPost = (url, data = {}, config = {}) =>
  api.post(url, data, config);

export const apiPut = (url, data = {}, config = {}) =>
  api.put(url, data, config);

export const apiPatch = (url, data = {}, config = {}) =>
  api.patch(url, data, config);

export const apiDelete = (url, config = {}) =>
  api.delete(url, config);

// ─── Domain-scoped endpoint builders ─────────────────────────────────────────

export const invoicesApi = {
  list:       (params)      => apiGet("/invoices", params),
  detail:     (id)          => apiGet(`/invoices/${id}`),
  create:     (data)        => apiPost("/invoices", data),
  update:     (id, data)    => apiPut(`/invoices/${id}`, data),
  remove:     (id)          => apiDelete(`/invoices/${id}`),
  markPaid:   (id)          => apiPatch(`/invoices/${id}/mark-paid`),
  activity:   (id)          => apiGet(`/invoices/${id}/activity`),
  reminders:  (id)          => apiGet(`/invoices/${id}/reminders`),
};

export const remindersApi = {
  send:       (invoiceId)   => apiPost(`/reminders/send/${invoiceId}`),
  history:    (params)      => apiGet("/reminders", params),
};

export const dashboardApi = {
  stats:      ()            => apiGet("/dashboard/stats"),
  activity:   (limit = 10) => apiGet("/dashboard/activity", { limit }),
};

export const activityApi = {
  list:       (params)      => apiGet("/activity", params),
};

export default api;