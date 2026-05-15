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
  User,
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
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  REMINDER_SENT: {
    label: "Reminder sent",
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  MARKED_PAID: {
    label: "Marked as paid",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  OVERDUE_DETECTED: {
    label: "Became overdue",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  STATUS_CHANGED: {
    label: "Status updated",
    icon: RefreshCw,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
};

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-slate-400" />
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      {count != null && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold px-1.5">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 mt-0.5">
        <Icon size={13} className="text-slate-500" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-800">{children}</div>
      </div>
    </div>
  );
}

// ─── Reminder history card ────────────────────────────────────────────────────

function ReminderHistoryItem({ reminder, index }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700">Reminder sent</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(reminder.sentAt)}</p>
      </div>
      <Mail size={12} className="text-slate-300 shrink-0" />
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
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            config.bg,
            "border-white ring-2 ring-slate-100"
          )}
        >
          <Icon size={13} className={config.color} />
        </span>
        {!isLast && <div className="w-px flex-1 bg-slate-100 my-1" />}
      </div>

      {/* Content */}
      <div className="pb-4 min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 leading-none">
          {activity.description ?? config.label}
        </p>
        <p className="text-xs text-slate-400 mt-1">{formatDateTime(activity.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50">
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
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
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
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <AlertTriangle size={20} className="text-red-500" />
      </span>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">{message ?? "Invoice not found"}</p>
        <p className="text-xs text-slate-400 mt-1">
          This invoice may have been deleted.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-slate-200 text-xs">
          Go back
        </Button>
        <Button asChild size="sm" className="bg-slate-900 text-white text-xs hover:bg-slate-700">
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 text-slate-500 hover:text-slate-800 -ml-2 h-8 px-2"
          >
            <ArrowLeft size={14} />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
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
              className="gap-1.5 h-8 text-xs border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
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
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Card header */}
              <div
                className={cn(
                  "px-6 pt-6 pb-5 border-b",
                  invoice.status === "OVERDUE"
                    ? "border-red-100 bg-red-50/30"
                    : invoice.status === "PAID"
                    ? "border-emerald-100 bg-emerald-50/20"
                    : "border-slate-100 bg-slate-50/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wider">
                      Invoice #{id.slice(0, 8).toUpperCase()}
                    </p>
                    <h1 className="text-lg font-bold text-slate-900 truncate">
                      {invoice.clientName}
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">{invoice.clientEmail}</p>
                  </div>
                  <StatusBadge status={invoice.status} size="md" showIcon />
                </div>

                {/* Amount hero */}
                <div className="mt-4">
                  <p className="text-xs text-slate-400 mb-1">Invoice Amount</p>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {formatCurrency(invoice.amount)}
                  </p>
                </div>
              </div>

              {/* Detail rows */}
              <div className="px-6 divide-y-0">
                <DetailRow icon={Mail} label="Client Email">
                  <a
                    href={`mailto:${invoice.clientEmail}`}
                    className="text-slate-800 hover:text-slate-600 transition-colors"
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
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {invoice.notes}
                    </p>
                  </DetailRow>
                )}
              </div>
            </div>

            {/* Activity timeline */}
            {activities.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Actions</h2>

              {/* Mark paid */}
              {invoice.status !== "PAID" && (
                <Button
                  onClick={handleMarkPaid}
                  disabled={markingPaid}
                  className="w-full h-9 gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
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
                        className={cn(
                          "w-full h-9 gap-1.5 text-sm border-slate-200",
                          onCooldown
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        {reminding ? (
                          <>
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
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
                className="w-full h-9 gap-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50"
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
                className="w-full h-9 gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete Invoice
              </Button>
            </div>

            {/* Paid notice */}
            {invoice.status === "PAID" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Payment received</p>
                  <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                    This invoice has been settled. No further reminders will be sent.
                  </p>
                </div>
              </div>
            )}

            {/* Overdue notice */}
            {invoice.status === "OVERDUE" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Payment overdue</p>
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                    Send a reminder or mark as paid once payment is received.
                  </p>
                </div>
              </div>
            )}

            {/* Reminder history */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={History} title="Reminder History" count={reminderCount} />

              {reminders.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <Bell size={20} className="text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">No reminders sent yet</p>
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