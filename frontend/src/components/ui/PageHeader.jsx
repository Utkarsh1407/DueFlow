// components/ui/PageHeader.jsx

/**
 * PageHeader — consistent page-level header for DueFlow
 *
 * Usage:
 *   <PageHeader
 *     title="Invoices"
 *     description="Manage and track all client invoices"
 *     badge={{ label: '12 invoices', color: 'blue' }}
 *     breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Invoices' }]}
 *     actions={[
 *       {
 *         label: 'New Invoice',
 *         icon: <Plus />,
 *         onClick: () => navigate('/invoices/new'),
 *         variant: 'primary',
 *       },
 *       {
 *         label: 'Export',
 *         icon: <Download />,
 *         onClick: handleExport,
 *         variant: 'ghost',
 *       },
 *     ]}
 *   />
 */

import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

// ─── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  blue:    "bg-blue-500/10    text-blue-400    ring-1 ring-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  amber:   "bg-amber-500/10   text-amber-400   ring-1 ring-amber-500/20",
  red:     "bg-red-500/10     text-red-400     ring-1 ring-red-500/20",
  violet:  "bg-violet-500/10  text-violet-400  ring-1 ring-violet-500/20",
  zinc:    "bg-zinc-800       text-zinc-400    ring-1 ring-zinc-700",
  cyan:    "bg-cyan-500/10    text-cyan-400    ring-1 ring-cyan-500/20",
};

function Badge({ label, color = "zinc", dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${BADGE_COLORS[color] || BADGE_COLORS.zinc}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            color === "zinc" ? "bg-zinc-400" : `bg-${color}-400`
          }`}
        />
      )}
      {label}
    </span>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
const ACTION_VARIANTS = {
  primary:
    "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/30",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
  ghost:
    "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70",
  danger:
    "bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20",
};

function ActionButton({
  label,
  icon,
  onClick,
  href,
  variant = "secondary",
  disabled = false,
  loading = false,
}) {
  const cls = `
    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium
    transition-all duration-150 whitespace-nowrap
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
    ${ACTION_VARIANTS[variant] || ACTION_VARIANTS.secondary}
  `;

  if (href) {
    return (
      <Link to={href} className={cls}>
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{icon ? "" : label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled || loading} className={cls}>
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
      <Link
        to="/"
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-xs ${
                  isLast ? "text-zinc-300 font-medium" : "text-zinc-500"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ─── Status Indicator ─────────────────────────────────────────────────────────
function StatusIndicator({ status }) {
  const STATUS_MAP = {
    live:    { dot: "bg-emerald-400 animate-pulse", label: "Live" },
    loading: { dot: "bg-amber-400 animate-pulse",   label: "Loading" },
    error:   { dot: "bg-red-400",                   label: "Error" },
    offline: { dot: "bg-zinc-500",                  label: "Offline" },
  };

  const s = STATUS_MAP[status];
  if (!s) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PageHeader({
  // Core
  title,
  description,

  // Decorations
  badge,          // { label, color, dot }
  icon,           // JSX element shown left of title
  status,         // 'live' | 'loading' | 'error' | 'offline'

  // Navigation
  breadcrumbs,    // [{ label, href? }]
  backHref,       // simple back link
  backLabel = "Back",

  // Actions — array of { label, icon, onClick, href, variant, disabled, loading }
  actions = [],

  // Extra content slot (e.g. tabs, filters)
  children,

  // Layout
  divider = true,
  compact = false,
  className = "",
}) {
  return (
    <header className={`flex flex-col gap-3 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Back link */}
      {backHref && !breadcrumbs && (
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          {backLabel}
        </Link>
      )}

      {/* Main row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Title + Description */}
        <div className={`flex items-start gap-3.5 min-w-0 ${compact ? "" : "py-1"}`}>
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}

          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className={`font-semibold text-zinc-100 leading-tight truncate ${
                  compact ? "text-xl" : "text-2xl sm:text-3xl"
                }`}
              >
                {title}
              </h1>

              {badge && <Badge {...badge} />}
              {status && <StatusIndicator status={status} />}
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, i) => (
              <ActionButton key={i} {...action} />
            ))}
          </div>
        )}
      </div>

      {/* Extra slot (tabs, filters, etc.) */}
      {children && <div>{children}</div>}

      {/* Divider */}
      {divider && (
        <div className="h-px bg-zinc-800/80 mt-1" />
      )}
    </header>
  );
}

// Named sub-components for flexible use
export { Badge, ActionButton, Breadcrumbs, StatusIndicator };