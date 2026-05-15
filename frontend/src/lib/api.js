import axios from "axios";
import { toast } from "sonner";

// Clerk's global getter — works outside React components
let getTokenFn = null;

export function setTokenGetter(fn) {
  getTokenFn = fn;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every outgoing request
api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.error ?? "Something went wrong.";

    if (status === 401) toast.error("Session expired. Please sign in again.");
    else if (status === 429) toast.error(message);
    else if (status === 502) toast.error("Email service unavailable.");
    else if (status >= 500) toast.error("Server error. Please try again.");

    return Promise.reject(error);
  }
);

// ── Invoice endpoints ─────────────────────────────────────────────────────────
export const invoiceApi = {
  getAll:   (params)     => api.get("/invoices", { params }),
  getById:  (id)         => api.get(`/invoices/${id}`),
  create:   (data)       => api.post("/invoices", data),
  update:   (id, data)   => api.patch(`/invoices/${id}`, data),
  markPaid: (id)         => api.patch(`/invoices/${id}/pay`),
  delete:   (id)         => api.delete(`/invoices/${id}`),
  getReminders:       (id) => api.get(`/invoices/${id}/reminders`),
  getReminderStatus:  (id) => api.get(`/invoices/${id}/reminders/status`),
};

// ── Reminder endpoints ────────────────────────────────────────────────────────
export const reminderApi = {
  send:        (invoiceId) => api.post(`/reminders/${invoiceId}/send`),
  getHistory:  (invoiceId) => api.get(`/reminders/${invoiceId}/history`),
  getCooldown: (invoiceId) => api.get(`/reminders/${invoiceId}/cooldown`),
};

// ── Dashboard endpoints ───────────────────────────────────────────────────────
export const dashboardApi = {
  getAll:           () => api.get("/dashboard"),
  getStats:         () => api.get("/dashboard/stats"),
  getChart:         () => api.get("/dashboard/chart"),
  getRecentActivity:() => api.get("/dashboard/recent-activity"),
};

// ── Activity endpoints ────────────────────────────────────────────────────────
export const activityApi = {
  getAll:       (params)    => api.get("/activity", { params }),
  getByInvoice: (invoiceId) => api.get(`/activity/${invoiceId}`),
};

// ... rest of invoiceApi, reminderApi, dashboardApi, activityApi unchanged
export default api;