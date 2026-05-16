import { useEffect, useState } from "react";
import { Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ReminderCooldown
 *
 * Displays a live countdown timer when a reminder cooldown is active.
 * Shows nothing when cooldown has expired.
 *
 * Props:
 *  - cooldownUntil : Date | null  — expiry timestamp from useReminders
 *  - className     : string
 *
 * All colors reference CSS custom properties so the light↔dark toggle in
 * globals.css is respected automatically — no Tailwind dark: prefixes needed.
 */
export function ReminderCooldown({ cooldownUntil, className }) {
  const [remaining, setRemaining] = useState(getRemainingMs(cooldownUntil));

  useEffect(() => {
    setRemaining(getRemainingMs(cooldownUntil));
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      const ms = getRemainingMs(cooldownUntil);
      setRemaining(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  // Don't render if no active cooldown
  if (!cooldownUntil || remaining <= 0) return null;

  const { hours, minutes, seconds } = decompose(remaining);
  const progressPercent = getProgressPercent(cooldownUntil, 24 * 60 * 60 * 1000);

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)]",
        "bg-[var(--color-pending-bg)]",
        "px-4 py-3",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-4 h-4 text-[var(--color-pending-text)] flex-shrink-0" />
        <span className="text-sm font-semibold text-[var(--color-pending-text)]">
          Cooldown Active
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-pending-text)] opacity-80 mb-3 leading-relaxed">
        To avoid spamming clients, reminders are limited to once every 24 hours per invoice.
      </p>

      {/* Countdown */}
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-3.5 h-3.5 text-[var(--color-pending)] flex-shrink-0" />
        <div className="flex items-baseline gap-1 font-mono">
          <TimeUnit value={hours} label="hr" />
          <span className="text-[var(--color-pending)] text-sm pb-1">:</span>
          <TimeUnit value={minutes} label="min" />
          <span className="text-[var(--color-pending)] text-sm pb-1">:</span>
          <TimeUnit value={seconds} label="sec" />
        </div>
      </div>

      {/* Progress bar track */}
      <div className="h-1.5 w-full rounded-full bg-[var(--color-border-strong)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-pending)] transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--color-text-muted)] text-right">
        {Math.round(progressPercent)}% elapsed
      </p>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[28px]">
      <span className="text-lg font-bold text-[var(--color-pending-text)] leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">
        {label}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRemainingMs(cooldownUntil) {
  if (!cooldownUntil) return 0;
  return Math.max(0, new Date(cooldownUntil) - Date.now());
}

function decompose(ms) {
  const totalSecs = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSecs / 3600),
    minutes: Math.floor((totalSecs % 3600) / 60),
    seconds: totalSecs % 60,
  };
}

/** Returns percent of the total window that has elapsed (0–100) */
function getProgressPercent(cooldownUntil, windowMs) {
  const remaining = getRemainingMs(cooldownUntil);
  const elapsed = windowMs - remaining;
  return Math.min(100, Math.max(0, (elapsed / windowMs) * 100));
}