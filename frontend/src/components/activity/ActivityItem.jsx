import { 
  FileText, 
  Bell, 
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
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  INVOICE_UPDATED: {
    icon: Edit3,
    label: "Invoice Updated",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    dot: "bg-violet-500",
  },
  INVOICE_DELETED: {
    icon: Trash2,
    label: "Invoice Deleted",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    dot: "bg-red-500",
  },
  REMINDER_SENT: {
    icon: Bell,
    label: "Reminder Sent",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
  STATUS_CHANGED: {
    icon: Clock,
    label: "Status Changed",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

const DEFAULT_CONFIG = {
  icon: FileText,
  label: "Activity",
  color: "text-gray-500",
  bg: "bg-gray-50",
  border: "border-gray-200",
  dot: "bg-gray-400",
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
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent" />
      )}

      {/* Icon bubble */}
      <div className="relative z-10 flex-shrink-0 mt-0.5">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            border ${config.bg} ${config.border}
            transition-all duration-200
            group-hover:scale-110 group-hover:shadow-sm
          `}
        >
          <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
        </div>
        {/* Pulse dot */}
        {/* <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${config.dot}`}
        /> */}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div
          className={`
            rounded-xl border border-gray-200 bg-white
            px-4 py-3 shadow-sm
            transition-all duration-200
            group-hover:border-gray-300 group-hover:shadow-md
          `}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold tracking-wide uppercase ${config.color}`}
              >
                {config.label}
              </span>
              {activity.invoice && (
                <>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-500 font-medium truncate max-w-[180px]">
                    {activity.invoice.clientName}
                  </span>
                </>
              )}
            </div>
            <time className="text-[11px] text-gray-400 whitespace-nowrap font-mono tracking-tight flex-shrink-0">
              {timeAgo}
            </time>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
              {activity.description}
            </p>
          )}

          {/* Invoice pill */}
          {activity.invoice && (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1">
                <FileText className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] text-gray-500 font-medium">
                  {activity.invoice.clientEmail || "Invoice"}
                </span>
                {activity.invoice.amount != null && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] font-semibold text-gray-700">
                      ₹{Number(activity.invoice.amount).toLocaleString()}
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