import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Status config ────────────────────────────────────────────────────────────
// All colours come exclusively from the CSS custom properties defined in
// globals.css (:root / html.dark). No Tailwind colour utilities here so that
// light ↔ dark toggling is handled automatically by the cascade.

const statusConfig = {
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    bgVar:   "--color-paid-bg",
    textVar: "--color-paid-text",
    dotVar:  "--color-paid",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    bgVar:   "--color-pending-bg",
    textVar: "--color-pending-text",
    dotVar:  "--color-pending",
  },
  OVERDUE: {
    label: "Overdue",
    icon: AlertCircle,
    bgVar:   "--color-overdue-bg",
    textVar: "--color-overdue-text",
    dotVar:  "--color-overdue",
  },
};

// ─── Size maps (structural only — no colour) ──────────────────────────────────

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

/**
 * StatusBadge
 *
 * @param {"PAID"|"PENDING"|"OVERDUE"} status
 * @param {"sm"|"md"|"lg"}             size
 * @param {boolean}                    showIcon – show lucide icon instead of dot
 * @param {string}                     className – extra utility classes
 */
export default function StatusBadge({
  status,
  size = "md",
  showIcon = false,
  className,
}) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  const Icon   = config.icon;

  // Derive the three token values once so they're easy to read below.
  const bg   = `var(${config.bgVar})`;
  const text = `var(${config.textVar})`;
  const dot  = `var(${config.dotVar})`;

  // Border: vivid status colour at ~25 % opacity (matches the original
  // emerald-200 / amber-200 / red-200 feel) via color-mix — supported in all
  // modern browsers (Chrome 111+, Firefox 113+, Safari 16.2+).
  // Ring: same colour at ~12 % opacity via box-shadow, matching ring-1.
  const borderColor = `color-mix(in srgb, ${dot} 30%, transparent)`;
  const ringColor   = `color-mix(in srgb, ${dot} 15%, transparent)`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: bg,
        color:           text,
        borderColor,
        boxShadow:       `0 0 0 1px ${ringColor}`,
      }}
    >
      {showIcon ? (
        <Icon size={iconSizes[size]} className="shrink-0" />
      ) : (
        <span
          className={cn("rounded-full shrink-0 animate-pulse", dotSizes[size])}
          style={{
            backgroundColor:    dot,
            animationPlayState: status === "PAID" ? "paused" : "running",
          }}
        />
      )}
      {config.label}
    </span>
  );
}