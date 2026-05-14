// components/ui/EmptyState.jsx

/**
 * EmptyState — contextual empty states for DueFlow
 *
 * Usage:
 *   <EmptyState variant="invoices" onAction={() => navigate('/invoices/new')} />
 *   <EmptyState variant="overdue" />
 *   <EmptyState variant="search" query="acme corp" onClear={clearSearch} />
 *   <EmptyState variant="activity" />
 *   <EmptyState variant="reminders" />
 *   <EmptyState variant="paid" />
 *   <EmptyState
 *     icon={<FileText />}
 *     title="No results"
 *     description="Try adjusting your filters."
 *   />
 */

import {
  FileText,
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  Bell,
  Inbox,
  Plus,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = {
  invoices: {
    icon: <FileText className="w-10 h-10" />,
    emoji: "📄",
    title: "No invoices yet",
    description:
      "Create your first invoice to start tracking payments and sending reminders.",
    actionLabel: "Create Invoice",
    actionIcon: <Plus className="w-4 h-4" />,
    color: "blue",
  },
  overdue: {
    icon: <CheckCircle2 className="w-10 h-10" />,
    emoji: "🎉",
    title: "No overdue invoices",
    description:
      "Great work — all your invoices are on track. Keep sending those reminders!",
    color: "emerald",
  },
  pending: {
    icon: <Clock className="w-10 h-10" />,
    emoji: "✅",
    title: "No pending invoices",
    description: "All invoices have been resolved. Time to create new ones!",
    actionLabel: "Create Invoice",
    actionIcon: <Plus className="w-4 h-4" />,
    color: "amber",
  },
  paid: {
    icon: <CheckCircle2 className="w-10 h-10" />,
    emoji: "💸",
    title: "No paid invoices yet",
    description:
      "Once clients pay their invoices, they'll show up here. Keep sending reminders!",
    color: "emerald",
  },
  search: {
    icon: <Search className="w-10 h-10" />,
    emoji: "🔍",
    title: "No results found",
    description:
      "We couldn't find any invoices matching your search. Try different keywords or clear your filters.",
    color: "zinc",
  },
  activity: {
    icon: <Inbox className="w-10 h-10" />,
    emoji: "📬",
    title: "No activity yet",
    description:
      "Activity will appear here as you create invoices, send reminders, and mark payments.",
    color: "zinc",
  },
  reminders: {
    icon: <Bell className="w-10 h-10" />,
    emoji: "🔔",
    title: "No reminders sent",
    description:
      "Select an invoice and click 'Send Reminder' to notify clients about outstanding payments.",
    color: "violet",
  },
  filtered: {
    icon: <AlertTriangle className="w-10 h-10" />,
    emoji: "🗂️",
    title: "No matching invoices",
    description:
      "No invoices match the current filters. Try adjusting or clearing your filters.",
    color: "zinc",
  },
};

// ─── Color Maps ───────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue: {
    ring: "ring-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-500 text-white",
    emojiRing: "bg-blue-500/10 ring-1 ring-blue-500/20",
  },
  emerald: {
    ring: "ring-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
    emojiRing: "bg-emerald-500/10 ring-1 ring-emerald-500/20",
  },
  amber: {
    ring: "ring-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    btn: "bg-amber-500 hover:bg-amber-400 text-black",
    emojiRing: "bg-amber-500/10 ring-1 ring-amber-500/20",
  },
  violet: {
    ring: "ring-violet-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    btn: "bg-violet-600 hover:bg-violet-500 text-white",
    emojiRing: "bg-violet-500/10 ring-1 ring-violet-500/20",
  },
  zinc: {
    ring: "ring-zinc-700",
    iconBg: "bg-zinc-800",
    iconColor: "text-zinc-400",
    btn: "bg-zinc-700 hover:bg-zinc-600 text-white",
    emojiRing: "bg-zinc-800 ring-1 ring-zinc-700",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function IconDisplay({ icon, emoji, color, size }) {
  const c = COLOR_MAP[color] || COLOR_MAP.zinc;
  const sizeClass = size === "sm" ? "w-14 h-14" : "w-20 h-20";
  const emojiSize = size === "sm" ? "text-2xl" : "text-4xl";

  if (emoji) {
    return (
      <div
        className={`${sizeClass} rounded-2xl ${c.emojiRing} flex items-center justify-center`}
      >
        <span className={emojiSize}>{emoji}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl ${c.iconBg} ring-1 ${c.ring} flex items-center justify-center ${c.iconColor}`}
    >
      {icon}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmptyState({
  // Preset shortcut
  variant,

  // Manual override (if no variant)
  icon,
  emoji,
  title,
  description,
  actionLabel,
  actionIcon,
  secondaryLabel,
  color = "zinc",

  // Callbacks
  onAction,
  onSecondary,

  // Search-specific helper
  query,
  onClear,

  // Layout
  size = "md", // "sm" | "md" | "lg"
  className = "",
}) {
  // Merge preset with manual props
  const preset = variant ? PRESETS[variant] || {} : {};

  const resolvedIcon = icon ?? preset.icon;
  const resolvedEmoji = emoji ?? preset.emoji;
  const resolvedTitle = title ?? preset.title ?? "Nothing here yet";
  const resolvedDescription =
    description ??
    (variant === "search" && query
      ? `No results for "${query}". Try different keywords.`
      : preset.description ?? "");
  const resolvedActionLabel = actionLabel ?? preset.actionLabel;
  const resolvedActionIcon = actionIcon ?? preset.actionIcon;
  const resolvedColor = color !== "zinc" ? color : preset.color ?? "zinc";
  const resolvedSecondaryLabel =
    secondaryLabel ?? (variant === "search" ? "Clear search" : undefined);
  const resolvedSecondary = onSecondary ?? onClear;

  const c = COLOR_MAP[resolvedColor] || COLOR_MAP.zinc;

  // Size-driven spacing
  const paddingClass =
    size === "sm" ? "py-8 px-6" : size === "lg" ? "py-20 px-8" : "py-14 px-8";
  const gapClass = size === "sm" ? "gap-3" : "gap-4";
  const titleClass =
    size === "sm"
      ? "text-base font-semibold"
      : size === "lg"
      ? "text-2xl font-semibold"
      : "text-lg font-semibold";
  const descClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${paddingClass} ${gapClass} ${className}`}
    >
      {/* Icon / Emoji */}
      <IconDisplay
        icon={resolvedIcon}
        emoji={resolvedEmoji}
        color={resolvedColor}
        size={size}
      />

      {/* Text */}
      <div className={`flex flex-col ${size === "sm" ? "gap-1" : "gap-2"} max-w-xs`}>
        <h3 className={`${titleClass} text-zinc-100`}>{resolvedTitle}</h3>
        {resolvedDescription && (
          <p className={`${descClass} text-zinc-400 leading-relaxed`}>
            {resolvedDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      {(resolvedActionLabel || resolvedSecondaryLabel) && (
        <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
          {resolvedActionLabel && onAction && (
            <button
              onClick={onAction}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${c.btn}`}
            >
              {resolvedActionIcon}
              {resolvedActionLabel}
            </button>
          )}

          {resolvedSecondaryLabel && resolvedSecondary && (
            <button
              onClick={resolvedSecondary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 transition-all duration-150"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resolvedSecondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Inline variant (compact, no card wrapper) ────────────────────────────────
export function InlineEmptyState({ icon, message, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-1 text-zinc-400">
      <div className="flex items-center gap-2.5 text-sm">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <span>{message}</span>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}