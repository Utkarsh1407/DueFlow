import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "bg-[var(--color-bg-subtle)]",
  iconFg = "text-[var(--color-text-tertiary)]",
  trend,
  prefix = "",
  loading = false,
  onClick,
}) {
  const isClickable = typeof onClick === "function";
  if (loading) return <StatCardSkeleton />;
  const trendPositive = trend?.value > 0;
  const trendNeutral = trend?.value === 0;

  return (
    <div
      onClick={onClick}
      className={[
        "group relative flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 transition-all duration-200",
        isClickable ? "cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-sm" : "",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <p
          className="text-[12.5px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconColor}`}>
          {Icon && <Icon size={15} className={iconFg} strokeWidth={2} />}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between gap-2">
        <p
          className="text-[28px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {/* Trend badge */}
        {trend && (
          <div
            className={[
              "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium mb-0.5",
              trendNeutral
                ? "bg-[var(--color-bg-subtle)] text-[var(--color-text-tertiary)]"
                : trendPositive
                ? "bg-[var(--color-paid-bg)] text-[var(--color-paid-text)]"
                : "bg-[var(--color-overdue-bg)] text-[var(--color-overdue-text)]",
            ].join(" ")}
          >
            {trendNeutral ? (
              <Minus size={11} strokeWidth={2.5} />
            ) : trendPositive ? (
              <TrendingUp size={11} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={11} strokeWidth={2.5} />
            )}
            <span>
              {trendPositive && "+"}
              {trend.value}%{trend.label ? ` ${trend.label}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full w-0 rounded-full transition-all duration-500 ${
            isClickable ? "group-hover:w-full bg-[var(--color-brand-accent)]" : ""
          }`}
        />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-start justify-between">
        <div className="h-3 w-24 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
        <div className="h-8 w-8 rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-8 w-20 rounded-lg bg-[var(--color-bg-subtle)] animate-pulse" />
        <div className="h-6 w-14 rounded-lg bg-[var(--color-bg-subtle)] animate-pulse" />
      </div>
    </div>
  );
}