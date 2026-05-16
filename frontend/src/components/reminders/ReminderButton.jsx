import { Bell, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ReminderButton
 *
 * Props:
 *  - onSend        : () => void  — triggers sendReminder from useReminders
 *  - sending       : boolean     — disables button while request in-flight
 *  - isOnCooldown  : boolean     — shows cooldown state
 *  - cooldownUntil : Date|null   — used for tooltip label
 *  - reminderCount : number      — badge showing how many reminders sent
 *  - variant       : "default" | "outline" | "ghost"
 *  - size          : "sm" | "md" | "lg"
 *  - className     : string
 */
export function ReminderButton({
  onSend,
  sending = false,
  isOnCooldown = false,
  cooldownUntil = null,
  reminderCount = 0,
  variant = "default",
  size = "md",
  className,
}) {
  const disabled = sending || isOnCooldown;

  // ─── Cooldown label ────────────────────────────────────────────────────────
  const cooldownLabel = (() => {
    if (!cooldownUntil) return null;
    const diffMs = new Date(cooldownUntil) - Date.now();
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Available in ${hours}h ${mins}m`;
    return `Available in ${mins}m`;
  })();

  // ─── Size classes ──────────────────────────────────────────────────────────
  const sizeClasses = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-10 px-5 text-sm gap-2",
  }[size] ?? "h-9 px-4 text-sm gap-2";

  // ─── Variant classes ───────────────────────────────────────────────────────
  // All color values reference CSS custom properties so light/dark toggling
  // is handled automatically by globals.css without any Tailwind dark: prefix.
  const variantClasses = {
    default: cn(
      "bg-[var(--color-brand)] text-white border border-[var(--color-border)]",
      "hover:opacity-90",
      "disabled:opacity-50 disabled:text-[var(--color-text-muted)]"
    ),
    outline: cn(
      "bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-strong)]",
      "hover:bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-strong)]",
      "disabled:text-[var(--color-text-muted)] disabled:border-[var(--color-border)]"
    ),
    ghost: cn(
      "bg-transparent text-[var(--color-text-tertiary)] border border-transparent",
      "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
      "disabled:text-[var(--color-text-muted)]"
    ),
  }[variant] ?? "";

  // ─── Icon ──────────────────────────────────────────────────────────────────
  const Icon = () => {
    if (sending) return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    if (isOnCooldown) return <BellOff className="w-3.5 h-3.5" />;
    return <Bell className="w-3.5 h-3.5" />;
  };

  return (
    <div className="relative inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        title={isOnCooldown ? cooldownLabel ?? "Cooldown active" : "Send payment reminder"}
        className={cn(
          "relative inline-flex items-center justify-center font-medium rounded-md",
          "transition-all duration-150 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-60",
          sizeClasses,
          variantClasses,
          className
        )}
      >
        <Icon />

        <span>
          {sending ? "Sending…" : isOnCooldown ? "Reminder Sent" : "Send Reminder"}
        </span>

        {/* Badge: reminder count */}
        {reminderCount > 0 && !sending && (
          <span
            className={cn(
              "ml-1 inline-flex items-center justify-center",
              "w-4 h-4 rounded-full text-[10px] font-semibold leading-none",
              isOnCooldown
                // Cooldown badge — uses pending (amber) semantic tokens
                ? "bg-[var(--color-pending-bg)] text-[var(--color-pending-text)]"
                // Normal badge — uses subtle bg with secondary text
                : "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
            )}
          >
            {reminderCount > 9 ? "9+" : reminderCount}
          </span>
        )}
      </button>

      {/* Cooldown sub-label */}
      {isOnCooldown && cooldownLabel && (
        <span className="text-[11px] text-[var(--color-pending-text)] font-medium pl-0.5">
          {cooldownLabel}
        </span>
      )}
    </div>
  );
}