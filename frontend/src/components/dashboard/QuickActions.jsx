import { useNavigate } from "react-router-dom";
import { FilePlus2, Bell, AlertCircle, Download, ChevronRight, Zap } from "lucide-react";

const ACTIONS = [
  {
    id: "new-invoice",
    label: "New invoice",
    description: "Create and send a new invoice",
    icon: FilePlus2,
    iconBg: "bg-[var(--color-brand)]",
    iconFg: "text-white",
    accent: "var(--color-brand-accent)",
    path: "/invoices/new",
    primary: true,
  },
  {
    id: "send-reminders",
    label: "Send reminders",
    description: "Nudge all overdue clients",
    icon: Bell,
    iconBg: "bg-[var(--color-pending-bg)]",
    iconFg: "text-[var(--color-pending-text)]",
    path: "/reminders",
    primary: false,
  },
  {
    id: "view-overdue",
    label: "View overdue",
    description: "Review invoices past due date",
    icon: AlertCircle,
    iconBg: "bg-[var(--color-overdue-bg)]",
    iconFg: "text-[var(--color-overdue-text)]",
    path: "/invoices?status=overdue",
    primary: false,
  },
  {
    id: "export",
    label: "Export data",
    description: "Download invoices as CSV",
    icon: Download,
    iconBg: "bg-[var(--color-bg-subtle)]",
    iconFg: "text-[var(--color-text-secondary)]",
    path: null,
    primary: false,
  },
];

function PrimaryAction({ action, onClick }) {
  const Icon = action.icon;
  return (
    <button
      onClick={() => onClick(action)}
      className="group relative flex items-center gap-3 w-full rounded-2xl bg-[var(--color-brand)] px-4 py-4 text-left overflow-hidden transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
    >
      {/* Accent glow */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: action.accent }}
      />
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 flex-shrink-0">
        <Icon size={16} className="text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white leading-snug"
           style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {action.label}
        </p>
        <p className="text-[11.5px] text-white/50 mt-0.5">{action.description}</p>
      </div>
      <ChevronRight
        size={14}
        className="text-white/30 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </button>
  );
}

function SecondaryAction({ action, onClick }) {
  const Icon = action.icon;
  return (
    <button
      onClick={() => onClick(action)}
      className="group flex items-center gap-3 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3.5 py-3 text-left transition-all duration-150 hover:border-[var(--color-border-strong)] hover:shadow-sm active:scale-[0.99]"
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${action.iconBg}`}>
        <Icon size={13} className={action.iconFg} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-[var(--color-text-primary)] leading-none"
           style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {action.label}
        </p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">
          {action.description}
        </p>
      </div>
      <ChevronRight
        size={13}
        className="text-[var(--color-border-strong)] flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--color-text-tertiary)]"
        strokeWidth={2}
      />
    </button>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3.5 w-24 rounded-full bg-[var(--color-bg-subtle)] animate-pulse" />
      </div>
      <div className="h-[72px] rounded-2xl bg-[var(--color-bg-subtle)] animate-pulse mb-3" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[54px] rounded-xl bg-[var(--color-bg-subtle)] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function QuickActions({ onExport, overdueCount = 0, pendingReminders = 0, loading = false }) {
  const navigate = useNavigate();
  if (loading) return <QuickActionsSkeleton />;

  function handleAction(action) {
    if (action.id === "export") { onExport?.(); return; }
    if (action.path) navigate(action.path);
  }

  const [primary, ...secondary] = ACTIONS;

  const enriched = secondary.map((a) => {
    if (a.id === "send-reminders" && pendingReminders > 0)
      return { ...a, description: `${pendingReminders} pending · nudge them now` };
    if (a.id === "view-overdue" && overdueCount > 0)
      return { ...a, description: `${overdueCount} invoices past due date` };
    return a;
  });

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap size={13} className="text-[var(--color-text-muted)]" strokeWidth={2} />
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)]"
           style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Quick actions
        </p>
      </div>

      <PrimaryAction action={primary} onClick={handleAction} />

      {/* Divider */}
      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-[var(--color-bg-subtle)]" />
        <span className="text-[10.5px] text-[var(--color-text-placeholder)] uppercase tracking-widest">
          More
        </span>
        <div className="h-px flex-1 bg-[var(--color-bg-subtle)]" />
      </div>

      <div className="space-y-2">
        {enriched.map((action) => (
          <SecondaryAction key={action.id} action={action} onClick={handleAction} />
        ))}
      </div>
    </div>
  );
}