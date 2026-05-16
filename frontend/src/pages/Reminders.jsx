// client/src/pages/Reminders.jsx

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bell, Clock, CheckCircle2,
  AlertTriangle, Mail, Loader2,
  RefreshCw, Send,
} from "lucide-react";
import { format, isPast, differenceInHours } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { dueDateLabel } from "@/lib/utils";
import api from "@/lib/api";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const STATUS_FILTERS = [
  { value: "ALL",     label: "All Unpaid"   },
  { value: "OVERDUE", label: "Overdue"      },
  { value: "PENDING", label: "Pending"      },
];

export default function Reminders() {
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("ALL");
  const [sending, setSending]       = useState({}); // { [invoiceId]: boolean }
  const [cooldowns, setCooldowns]   = useState({}); // { [invoiceId]: Date }
  const [reminderCounts, setReminderCounts] = useState({}); // { [invoiceId]: number }

  // ── Fetch all unpaid invoices ───────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/invoices", {
        params: { status: filter === "ALL" ? undefined : filter },
      });

      // Unwrap server envelope
      const list = data.data?.invoices ?? data.data ?? data.invoices ?? [];

      // Keep only unpaid invoices
      const unpaid = list.filter((inv) => inv.status !== "PAID");
      setInvoices(unpaid);

      // Build cooldown map from reminder data already on each invoice
      const cooldownMap = {};
      const countMap    = {};

      unpaid.forEach((inv) => {
        const latestReminder = inv.reminders?.[0];
        countMap[inv.id] = inv._count?.reminders ?? 0;

        if (latestReminder) {
          const until = new Date(latestReminder.sentAt).getTime() + COOLDOWN_MS;
          if (until > Date.now()) {
            cooldownMap[inv.id] = new Date(until);
          }
        }
      });

      setCooldowns(cooldownMap);
      setReminderCounts(countMap);
    } catch (err) {
      toast.error("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ── Send reminder for one invoice ──────────────────────────────────────────
  const sendReminder = async (invoice) => {
    const { id, clientName, clientEmail } = invoice;

    const cooldown = cooldowns[id];
    if (cooldown && new Date() < cooldown) {
      toast.warning("Cooldown active. Please wait before sending again.");
      return;
    }

    setSending((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await api.post(`/reminders/${id}/send`);

      // Safe unwrap — don't crash if shape is unexpected
      const reminder = res?.data?.data?.reminder
        ?? res?.data?.reminder
        ?? {};

      // Update UI state
      setCooldowns((prev) => ({
        ...prev,
        [id]: new Date(Date.now() + COOLDOWN_MS),
      }));
      setReminderCounts((prev) => ({
        ...prev,
        [id]: (prev[id] ?? 0) + 1,
      }));

      // Update the invoice's reminders array in local state
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? {
                ...inv,
                reminders: [{ sentAt: new Date().toISOString(), ...reminder }, ...(inv.reminders ?? [])],
              }
            : inv
        )
      );
      console.log("REMINDER RESPONSE:", JSON.stringify(res.data, null, 2));
      toast.success(`Reminder sent to ${clientName}`, {
        description: clientEmail,
      });

    } catch (err) {
      // Only fires on actual HTTP errors (4xx, 5xx)
      const status  = err?.response?.status;
      const message = err?.response?.data?.error ?? "Failed to send reminder.";
      console.log("REMINDER ERROR STATUS:", err?.response?.status);
      console.log("REMINDER ERROR DATA:", JSON.stringify(err?.response?.data, null, 2));
      console.log("REMINDER JS ERROR:", err?.message);
      if (status === 429) {
        toast.warning(message); // cooldown from server
      } else if (status === 404) {
        toast.error("Invoice not found.");
      } else {
        toast.error(message);
      }
    } finally {
      setSending((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const overdue    = invoices.filter((i) => i.status === "OVERDUE").length;
  const inCooldown = Object.values(cooldowns).filter(
    (d) => new Date() < d
  ).length;
  const totalSent  = Object.values(reminderCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 fade-in">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">
            Send and track payment reminders for unpaid invoices.
          </p>
        </div>
        <button
          onClick={fetchInvoices}
          className="btn-sm btn-outline flex items-center gap-2"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Unpaid invoices" value={invoices.length} color="default" />
        <StatCard label="Overdue"         value={overdue}         color="red"     />
        <StatCard label="In cooldown"     value={inCooldown}      color="amber"   />
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--color-bg-subtle)] p-1 w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={[
              "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all duration-150",
              filter === f.value
                ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-tertiary)]",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Invoice list ──────────────────────────────────────────────── */}
      {loading ? (
        <LoadingState />
      ) : invoices.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const isSending    = sending[invoice.id] ?? false;
            const cooldownDate = cooldowns[invoice.id];
            const onCooldown   = Boolean(cooldownDate && new Date() < cooldownDate);
            const count        = reminderCounts[invoice.id] ?? 0;
            const hoursLeft    = cooldownDate
              ? differenceInHours(new Date(cooldownDate), new Date())
              : 0;

            return (
              <InvoiceReminderRow
                key={invoice.id}
                invoice={invoice}
                isSending={isSending}
                onCooldown={onCooldown}
                cooldownDate={cooldownDate}
                hoursLeft={hoursLeft}
                reminderCount={count}
                onSend={() => sendReminder(invoice)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Invoice row ───────────────────────────────────────────────────────────────

function InvoiceReminderRow({
  invoice,
  isSending,
  onCooldown,
  cooldownDate,
  hoursLeft,
  reminderCount,
  onSend,
}) {
  const isOverdue = invoice.status === "OVERDUE";
  const disabled  = isSending || onCooldown;

  return (
    <div className={cn(
      "card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4",
      isOverdue && "border-[var(--color-overdue-bg)]"
    )}>
      {/* Left — invoice info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/invoices/${invoice.id}`}
            className="text-[13.5px] font-semibold text-[var(--color-text-primary)] hover:underline underline-offset-2 truncate"
          >
            {invoice.clientName}
          </Link>
          <StatusDot status={invoice.status} />
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-tertiary)]">
          <Mail size={11} />
          <span className="truncate">{invoice.clientEmail}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(invoice.amount)}
          </span>
          <span className={cn(
            "text-[12px] font-medium",
            isOverdue
              ? "text-[var(--color-overdue-text)]"
              : "text-[var(--color-pending-text)]"
          )}>
            {dueDateLabel(invoice.dueDate)}
          </span>
        </div>
      </div>

      {/* Middle — reminder meta */}
      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 text-right">
        {reminderCount > 0 ? (
          <>
            <span className="text-[11.5px] text-[var(--color-text-muted)]">
              Sent {reminderCount}×
            </span>
            {invoice.reminders?.[0]?.sentAt && (
              <span className="text-[11px] text-[var(--color-text-placeholder)]">
                Last: {format(new Date(invoice.reminders[0].sentAt), "MMM d")}
              </span>
            )}
          </>
        ) : (
          <span className="text-[11.5px] text-[var(--color-text-placeholder)] italic">
            Never reminded
          </span>
        )}
      </div>

      {/* Right — action button */}
      <div className="flex-shrink-0">
        {onCooldown ? (
          <button
            disabled
            className="btn-sm btn-secondary opacity-70 cursor-not-allowed flex items-center gap-1.5"
          >
            <Clock size={12} />
            {hoursLeft > 0 ? `${hoursLeft}h cooldown` : "Cooldown"}
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={disabled}
            className="btn-sm btn-primary flex items-center gap-1.5 press"
          >
            {isSending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={12} />
                {reminderCount > 0 ? "Resend" : "Send"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  // Map semantic color names to CSS custom properties
  const colorClass = {
    default: "text-[var(--color-text-primary)]",
    red:     "text-[var(--color-overdue-text)]",
    amber:   "text-[var(--color-pending-text)]",
  }[color] ?? "text-[var(--color-text-primary)]";

  return (
    <div className="card-padded text-center">
      <p className={cn("text-[22px] font-semibold tabular", colorClass)}>
        {value}
      </p>
      <p className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
    </div>
  );
}

function StatusDot({ status }) {
  const colorClass = {
    OVERDUE: "bg-[var(--color-overdue)]",
    PENDING: "bg-[var(--color-pending)]",
  }[status] ?? "bg-[var(--color-text-muted)]";

  return (
    <span className={cn(
      "inline-block h-1.5 w-1.5 rounded-full flex-shrink-0",
      colorClass
    )} />
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter }) {
  const messages = {
    ALL:     { title: "No reminders needed 🎉", desc: "All invoices are settled." },
    OVERDUE: { title: "No overdue invoices 🎉", desc: "Nothing is overdue right now." },
    PENDING: { title: "No pending invoices",    desc: "All caught up." },
  };
  const { title, desc } = messages[filter] ?? messages.ALL;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <CheckCircle2 size={22} className="text-[var(--color-paid)]" />
      </div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{desc}</p>
      <Link to="/invoices/new" className="btn-sm btn-primary mt-2">
        Create Invoice
      </Link>
    </div>
  );
}