import { 
  FileText, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Trash2,
  Edit3,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTIVITY_CONFIG = {
  INVOICE_CREATED: {
    icon: Plus,
    label: "Invoice Created",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    dot: "bg-blue-400",
  },
  INVOICE_UPDATED: {
    icon: Edit3,
    label: "Invoice Updated",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    dot: "bg-violet-400",
  },
  INVOICE_DELETED: {
    icon: Trash2,
    label: "Invoice Deleted",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    dot: "bg-rose-400",
  },
  REMINDER_SENT: {
    icon: Bell,
    label: "Reminder Sent",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    dot: "bg-amber-400",
  },
  MARKED_PAID: {
    icon: CheckCircle2,
    label: "Marked as Paid",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  OVERDUE_DETECTED: {
    icon: AlertTriangle,
    label: "Overdue Detected",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    dot: "bg-rose-400",
  },
  STATUS_CHANGED: {
    icon: Clock,
    label: "Status Changed",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    dot: "bg-slate-400",
  },
};

const DEFAULT_CONFIG = {
  icon: FileText,
  label: "Activity",
  color: "text-slate-400",
  bg: "bg-slate-400/10",
  border: "border-slate-400/20",
  dot: "bg-slate-400",
};

export default function ActivityItem({ activity, isLast = false, index = 0 }) {
  const config = ACTIVITY_CONFIG[activity.type] || DEFAULT_CONFIG;
  const Icon = config.icon;

  const timeAgo = activity.createdAt
    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
    : "just now";

  return (
    <div
      className="relative flex gap-4 group"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: "fadeSlideIn 0.4s ease both",
      }}
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-slate-700/80 to-transparent" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 flex-shrink-0 mt-0.5">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            border ${config.bg} ${config.border}
            transition-all duration-200
            group-hover:scale-110 group-hover:shadow-lg
          `}
        >
          <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
        </div>
        {/* Pulse dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f1117] ${config.dot}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div
          className={`
            rounded-xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm
            px-4 py-3 
            transition-all duration-200
            group-hover:border-slate-700/80 group-hover:bg-slate-800/50
          `}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold tracking-wide uppercase ${config.color} opacity-90`}
              >
                {config.label}
              </span>
              {activity.invoice && (
                <>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[180px]">
                    {activity.invoice.clientName}
                  </span>
                </>
              )}
            </div>
            <time className="text-[11px] text-slate-600 whitespace-nowrap font-mono tracking-tight flex-shrink-0">
              {timeAgo}
            </time>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Invoice pill */}
          {activity.invoice && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 px-2.5 py-1">
                <FileText className="w-3 h-3 text-slate-500" />
                <span className="text-[11px] text-slate-400 font-medium">
                  {activity.invoice.clientEmail || "Invoice"}
                </span>
                {activity.invoice.amount != null && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-semibold text-slate-300">
                      ${Number(activity.invoice.amount).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}