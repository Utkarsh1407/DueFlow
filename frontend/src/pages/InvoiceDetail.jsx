import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  DollarSign,
  FileText,
  CalendarDays,
  RefreshCw,
  History,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatusBadge from "@/components/invoices/StatusBadge";
import DueDateLabel from "@/components/invoices/DueDateLabel";
import DeleteDialog from "@/components/invoices/DeleteDialog";
import { useInvoiceDetail } from "@/hooks/useInvoiceDetail";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ─── Activity type config ─────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
  INVOICE_CREATED: {
    label: "Invoice created",
    icon: FileText,
    color: "var(--color-text-tertiary)",
    bg: "var(--color-bg-subtle)",
  },
  REMINDER_SENT: {
    label: "Reminder sent",
    icon: Bell,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  MARKED_PAID: {
    label: "Marked as paid",
    icon: CheckCircle2,
    color: "var(--color-paid)",
    bg: "var(--color-paid-bg)",
  },
  OVERDUE_DETECTED: {
    label: "Became overdue",
    icon: AlertTriangle,
    color: "var(--color-overdue)",
    bg: "var(--color-overdue-bg)",
  },
  STATUS_CHANGED: {
    label: "Status updated",
    icon: RefreshCw,
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
};

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} style={{ color: "var(--color-text-muted)" }} />
      <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
        {title}
      </h2>
      {count != null && (
        <span
          className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-semibold px-1.5"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            color: "var(--color-text-tertiary)",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div
      className="flex items-start gap-3 py-3 last:border-0"
      style={{ borderBottom: "1px solid var(--color-bg-subtle)" }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5"
        style={{ backgroundColor: "var(--color-bg-subtle)" }}
      >
        <Icon size={13} style={{ color: "var(--color-text-tertiary)" }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </p>
        <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Reminder history card ────────────────────────────────────────────────────

function ReminderHistoryItem({ reminder, index }) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 last:border-0"
      style={{ borderBottom: "1px solid var(--color-bg-subtle)" }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          color: "#2563EB",
        }}
      >
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Reminder sent
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {formatDateTime(reminder.sentAt)}
        </p>
      </div>
      <Mail size={12} style={{ color: "var(--color-border-strong)" }} className="shrink-0" />
    </div>
  );
}

// ─── Activity timeline item ───────────────────────────────────────────────────

function ActivityItem({ activity, isLast }) {
  const config = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.STATUS_CHANGED;
  const Icon = config.icon;

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2"
          style={{
            backgroundColor: config.bg,
            border: "1px solid var(--color-bg-card)",
            ringColor: "var(--color-border)",
          }}
        >
          <Icon size={13} style={{ color: config.color }} />
        </span>
        {!isLast && (
          <div
            className="w-px flex-1 my-1"
            style={{ backgroundColor: "var(--color-border)" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 min-w-0 flex-1">
        <p
          className="text-sm font-medium leading-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          {activity.description ?? config.label}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {formatDateTime(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div
          className="rounded-xl p-6 space-y-4 shadow-sm"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--color-bg-subtle)" }}>
              <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div
          className="rounded-xl p-5 space-y-3 shadow-sm"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function DetailError({ message }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: "var(--color-overdue-bg)",
          border: "1px solid var(--color-overdue-bg)",
        }}
      >
        <AlertTriangle size={20} style={{ color: "var(--color-overdue)" }} />
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {message ?? "Invoice not found"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          This invoice may have been deleted.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          Go back
        </Button>
        <Button
          asChild
          size="sm"
          className="text-xs"
          style={{ backgroundColor: "var(--color-brand)", color: "var(--color-bg-card)" }}
        >
          <Link to="/invoices">All Invoices</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    invoice,
    reminders,
    activities,
    loading,
    error,
    reminding,
    isOnCooldown,
    cooldownRemainingHours,
    reminderCount,
    sendReminder,
    markPaid,
    deleteInvoice,
  } = useInvoiceDetail(id);

  const [showDelete, setShowDelete] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  async function handleMarkPaid() {
    try {
      setMarkingPaid(true);
      await markPaid();
    } finally {
      setMarkingPaid(false);
    }
  }

  async function handleDelete() {
    await deleteInvoice();
    navigate("/invoices");
  }

  const onCooldown = isOnCooldown();

  if (loading) return <DetailSkeleton />;
  if (error) return <DetailError message={error} />;

  // Derive card header background based on status
  const cardHeaderStyle = (() => {
    if (invoice.status === "OVERDUE")
      return {
        backgroundColor: "var(--color-overdue-bg)",
        borderBottom: "1px solid var(--color-overdue-bg)",
      };
    if (invoice.status === "PAID")
      return {
        backgroundColor: "var(--color-paid-bg)",
        borderBottom: "1px solid var(--color-paid-bg)",
      };
    return {
      backgroundColor: "var(--color-bg-subtle)",
      borderBottom: "1px solid var(--color-border)",
    };
  })();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 -ml-2 h-8 px-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft size={14} />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              <Link to={`/invoices/${id}/edit`}>
                <Pencil size={12} />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDelete(true)}
              className="gap-1.5 h-8 text-xs"
              style={{
                borderColor: "var(--color-overdue-bg)",
                color: "var(--color-overdue-text)",
              }}
            >
              <Trash2 size={12} />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left: invoice detail ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Main info card */}
            <div
              className="rounded-xl shadow-sm overflow-hidden"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-5" style={cardHeaderStyle}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="text-xs mb-1 font-medium uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Invoice #{id.slice(0, 8).toUpperCase()}
                    </p>
                    <h1
                      className="text-lg font-bold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {invoice.clientName}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {invoice.clientEmail}
                    </p>
                  </div>
                  <StatusBadge status={invoice.status} size="md" showIcon />
                </div>

                {/* Amount hero */}
                <div className="mt-4">
                  <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                    Invoice Amount
                  </p>
                  <p
                    className="text-3xl font-bold tabular-nums tracking-tight"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {formatCurrency(invoice.amount)}
                  </p>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-6 divide-y-0">
                <DetailRow icon={Mail} label="Client Email">
                  <a
                    href={`mailto:${invoice.clientEmail}`}
                    className="transition-colors"
                    style={{ color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--color-text-secondary)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--color-text-primary)")}
                  >
                    {invoice.clientEmail}
                  </a>
                </DetailRow>

                <DetailRow icon={CalendarDays} label="Due Date">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{formatDate(invoice.dueDate)}</span>
                    <DueDateLabel
                      dueDate={invoice.dueDate}
                      status={invoice.status}
                      variant="badge"
                    />
                  </div>
                </DetailRow>

                <DetailRow icon={Clock} label="Created">
                  {formatDateTime(invoice.createdAt)}
                </DetailRow>

                {invoice.updatedAt !== invoice.createdAt && (
                  <DetailRow icon={RefreshCw} label="Last Updated">
                    {formatDateTime(invoice.updatedAt)}
                  </DetailRow>
                )}

                {invoice.notes && (
                  <DetailRow icon={FileText} label="Notes">
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {invoice.notes}
                    </p>
                  </DetailRow>
                )}
              </div>
            </div>

            {/* Activity timeline */}
            {activities.length > 0 && (
              <div
                className="rounded-xl p-5 shadow-sm"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-card)",
                }}
              >
                <SectionHeader icon={Activity} title="Activity Timeline" count={activities.length} />
                <div className="pt-1">
                  {activities.map((act, i) => (
                    <ActivityItem
                      key={act.id}
                      activity={act}
                      isLast={i === activities.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">
            {/* Action card */}
            <div
              className="rounded-xl p-5 shadow-sm space-y-3"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Actions
              </h2>

              {/* Mark paid */}
              {invoice.status !== "PAID" && (
                <Button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  className="w-full h-9 gap-1.5 text-sm"
                  style={{
                    backgroundColor: "var(--color-paid)",
                    color: "#fff",
                  }}
                >
                  {markingPaid ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Marking paid…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Mark as Paid
                    </>
                  )}
                </Button>
              )}

              {/* Send reminder */}
              {invoice.status !== "PAID" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        variant="outline"
                        onClick={() => sendReminder()}
                        disabled={reminding || onCooldown}
                        className="w-full h-9 gap-1.5 text-sm"
                        style={{
                          borderColor: "var(--color-border)",
                          color: onCooldown
                            ? "var(--color-text-muted)"
                            : "var(--color-text-secondary)",
                          opacity: onCooldown ? 0.6 : 1,
                          cursor: onCooldown ? "not-allowed" : "pointer",
                        }}
                      >
                        {reminding ? (
                          <>
                            <span
                              className="h-3.5 w-3.5 rounded-full border-2 animate-spin"
                              style={{
                                borderColor: "var(--color-border-strong)",
                                borderTopColor: "var(--color-text-secondary)",
                              }}
                            />
                            Sending…
                          </>
                        ) : onCooldown ? (
                          <>
                            <BellOff size={14} />
                            Reminder on cooldown
                          </>
                        ) : (
                          <>
                            <Bell size={14} />
                            Send Reminder
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {onCooldown && (
                    <TooltipContent side="bottom" className="text-xs">
                      Next reminder available in ~{cooldownRemainingHours()} hour(s)
                    </TooltipContent>
                  )}
                </Tooltip>
              )}

              {/* Edit */}
              <Button
                asChild
                variant="ghost"
                className="w-full h-9 gap-1.5 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Link to={`/invoices/${id}/edit`}>
                  <Pencil size={14} />
                  Edit Invoice
                </Link>
              </Button>

              {/* Delete */}
              <Button
                variant="ghost"
                onClick={() => setShowDelete(true)}
                className="w-full h-9 gap-1.5 text-sm"
                style={{ color: "var(--color-overdue-text)" }}
              >
                <Trash2 size={14} />
                Delete Invoice
              </Button>
            </div>

            {/* Paid notice */}
            {invoice.status === "PAID" && (
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  border: "1px solid var(--color-paid-bg)",
                  backgroundColor: "var(--color-paid-bg)",
                }}
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--color-paid)" }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-paid-text)" }}>
                    Payment received
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "var(--color-paid-text)" }}
                  >
                    This invoice has been settled. No further reminders will be sent.
                  </p>
                </div>
              </div>
            )}

            {/* Overdue notice */}
            {invoice.status === "OVERDUE" && (
              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  border: "1px solid var(--color-overdue-bg)",
                  backgroundColor: "var(--color-overdue-bg)",
                }}
              >
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--color-overdue)" }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-overdue-text)" }}
                  >
                    Payment overdue
                  </p>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: "var(--color-overdue-text)" }}
                  >
                    Send a reminder or mark as paid once payment is received.
                  </p>
                </div>
              </div>
            )}

            {/* Reminder history */}
            <div
              className="rounded-xl p-5 shadow-sm"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-card)",
              }}
            >
              <SectionHeader icon={History} title="Reminder History" count={reminderCount} />

              {reminders.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Bell size={20} className="mb-2" style={{ color: "var(--color-border)" }} />
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    No reminders sent yet
                  </p>
                </div>
              ) : (
                <div>
                  {reminders.map((r, i) => (
                    <ReminderHistoryItem key={r.id} reminder={r} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Delete dialog ── */}
        <DeleteDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          invoice={invoice}
          onConfirm={handleDelete}
        />
      </div>
    </TooltipProvider>
  );
}