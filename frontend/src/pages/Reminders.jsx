import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Bell,
  ArrowLeft,
  FileText,
  User,
  Mail,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useReminders } from "@/hooks/useReminders";
import { ReminderButton } from "@/components/reminders/ReminderButton";
import { ReminderHistory } from "@/components/reminders/ReminderHistory";
import { ReminderCooldown } from "@/components/reminders/ReminderCooldown";
import  StatusBadge  from "@/components/invoices/StatusBadge";
import  DueDateLabel  from "@/components/invoices/DueDateLabel";
import  LoadingSkeleton  from "@/components/ui/LoadingSkeleton";
import api from "@/lib/api";

/**
 * Reminders Page
 * Route: /invoices/:id/reminders
 *
 * Shows invoice summary + full reminder workflow for a specific invoice.
 */
export default function Reminders() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [invoiceError, setInvoiceError] = useState(null);

  const {
    reminders,
    loadingHistory,
    sending,
    cooldownUntil,
    isOnCooldown,
    reminderCount,
    lastSentAt,
    sendReminder,
    fetchHistory,
  } = useReminders(id);

  // Fetch invoice details
  useEffect(() => {
    if (!id) return;
    setLoadingInvoice(true);
    api
      .get(`/invoices/${id}`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch(() => setInvoiceError("Invoice not found."))
      .finally(() => setLoadingInvoice(false));
  }, [id]);

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loadingInvoice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-40 w-full rounded-xl" />
        <LoadingSkeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (invoiceError || !invoice) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
          Invoice Not Found
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          {invoiceError ?? "This invoice doesn't exist or was deleted."}
        </p>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Invoices
        </Link>
      </div>
    );
  }

  const isOverdue =
    invoice.status !== "PAID" && isPast(new Date(invoice.dueDate));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* ── Back nav ─────────────────────────────────────────────────────── */}
      <Link
        to={`/invoices/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Invoice
      </Link>

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Reminders
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Manage payment reminders for this invoice.
          </p>
        </div>

        <StatusBadge status={invoice.status} size="lg" />
      </div>

      {/* ── Invoice summary card ──────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl border p-5 space-y-4",
          isOverdue
            ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50"
        )}
      >
        {/* Invoice number + overdue banner */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Invoice #{invoice.id.slice(-6).toUpperCase()}
            </span>
          </div>
          {isOverdue && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </span>
          )}
          {invoice.status === "PAID" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Paid
            </span>
          )}
        </div>

        {/* Grid: client info + amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={User} label="Client" value={invoice.clientName} />
          <InfoRow icon={Mail} label="Email" value={invoice.clientEmail} />
          <InfoRow
            icon={DollarSign}
            label="Amount"
            value={
              <span className="font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(invoice.amount)}
              </span>
            }
          />
          <InfoRow
            icon={Calendar}
            label="Due Date"
            value={<DueDateLabel dueDate={invoice.dueDate} status={invoice.status} />}
          />
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-3.5 py-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-1">
              Notes
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* ── Action panel ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded-2xl border border-zinc-200 dark:border-zinc-800",
          "bg-white dark:bg-zinc-900/50 p-5 space-y-5"
        )}
      >
        <div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5">
            Send Payment Reminder
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            An email will be sent to{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {invoice.clientEmail}
            </span>{" "}
            with invoice details and a payment request.
          </p>
        </div>

        {/* Stats row */}
        {reminderCount > 0 && (
          <div className="flex flex-wrap gap-4">
            <StatPill
              icon={Bell}
              label="Reminders sent"
              value={reminderCount}
              color="blue"
            />
            {lastSentAt && (
              <StatPill
                icon={Clock}
                label="Last sent"
                value={format(new Date(lastSentAt), "MMM d, h:mm a")}
                color="zinc"
              />
            )}
          </div>
        )}

        {/* Cooldown warning */}
        <ReminderCooldown cooldownUntil={cooldownUntil} />

        {/* Send button — disable if invoice is paid */}
        {invoice.status === "PAID" ? (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              This invoice is marked as <strong>paid</strong>. No reminders needed.
            </span>
          </div>
        ) : (
          <ReminderButton
            onSend={sendReminder}
            sending={sending}
            isOnCooldown={isOnCooldown}
            cooldownUntil={cooldownUntil}
            reminderCount={reminderCount}
            size="lg"
          />
        )}
      </div>

      {/* ── Reminder history ─────────────────────────────────────────────── */}
      <ReminderHistory
        invoiceId={id}
        reminders={reminders}
        loading={loadingHistory}
        onMount={fetchHistory}
      />
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">
          {label}
        </p>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{value}</div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color = "zinc" }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400",
    zinc: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
        colors[color]
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-zinc-500 dark:text-zinc-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}