import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-100",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 ring-1 ring-amber-100",
    dot: "bg-amber-500",
  },
  OVERDUE: {
    label: "Overdue",
    icon: AlertCircle,
    className:
      "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-100",
    dot: "bg-red-500",
  },
};

/**
 * StatusBadge
 * @param {"PAID"|"PENDING"|"OVERDUE"} status
 * @param {"sm"|"md"|"lg"} size
 * @param {boolean} showIcon - show lucide icon instead of dot
 */
export default function StatusBadge({ status, size = "md", showIcon = false, className }) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const dotSizes = {
    sm: "size-1.5",
    md: "size-2",
    lg: "size-2.5",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon ? (
        <Icon size={iconSizes[size]} className="shrink-0" />
      ) : (
        <span
          className={cn("rounded-full shrink-0 animate-pulse", config.dot, dotSizes[size])}
          style={status === "PAID" ? { animationPlayState: "paused" } : undefined}
        />
      )}
      {config.label}
    </span>
  );
}