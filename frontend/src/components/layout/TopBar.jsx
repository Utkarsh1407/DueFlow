import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";

const ROUTE_META = {
  "/dashboard":             { title: "Dashboard",   crumbs: [] },
  "/dashboard/invoices":    { title: "Invoices",    crumbs: ["Invoices"] },
  "/dashboard/invoices/new":{ title: "New Invoice", crumbs: ["Invoices", "New"] },
  "/dashboard/reminders":   { title: "Reminders",   crumbs: ["Reminders"] },
  "/dashboard/activity":    { title: "Activity",    crumbs: ["Activity"] },
  "/dashboard/settings":    { title: "Settings",    crumbs: ["Settings"] },
};

function useRouteMeta() {
  const { pathname } = useLocation();
  if (/^\/dashboard\/invoices\/.+\/edit$/.test(pathname))
    return { title: "Edit Invoice", crumbs: ["Invoices", "Edit"] };
  if (/^\/dashboard\/invoices\/.+$/.test(pathname))
    return { title: "Invoice Detail", crumbs: ["Invoices", "Detail"] };
  return ROUTE_META[pathname] ?? { title: "DueFlow", crumbs: [] };
}

export default function TopBar({ onMenuClick, darkMode, onToggleDarkMode }) {
  const { title, crumbs } = useRouteMeta();

  return (
    <header className="flex h-14 flex-shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 sm:px-6 gap-3 transition-colors duration-200">

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0 mr-auto">
        {crumbs.length > 0 ? (
          <>
            <span className="text-[13px] text-[var(--color-text-muted)] hidden sm:block">
              DueFlow
            </span>
            {crumbs.map((crumb, i) => (
              <span key={i} className="hidden sm:flex items-center gap-1.5">
                <span className="text-[13px] text-[var(--color-text-placeholder)]">/</span>
                <span
                  className={`text-[13px] ${
                    i === crumbs.length - 1
                      ? "text-[var(--color-text-primary)] font-medium"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {crumb}
                </span>
              </span>
            ))}
            <span className="text-[14px] font-semibold text-[var(--color-text-primary)] sm:hidden">
              {title}
            </span>
          </>
        ) : (
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            {title}
          </span>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
          className={`relative flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${
            darkMode
              ? "bg-[var(--color-border-strong)]"
              : "bg-[var(--color-bg-hover)]"
          }`}
        >
          <span
            className={`absolute flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-bg-card)] shadow-sm transition-transform duration-300 ${
              darkMode ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          >
            {darkMode ? (
              <Moon size={11} className="text-[var(--color-text-secondary)]" strokeWidth={2} />
            ) : (
              <Sun size={11} className="text-[var(--color-pending)]" strokeWidth={2} />
            )}
          </span>
        </button>
      </div>
    </header>
  );
}