import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Activity,
  X,
  Zap,
  Settings,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Invoices",
    to: "/invoices",
    icon: FileText,
  },
  {
    label: "Reminders",
    to: "/reminders",
    icon: Bell,
  },
  {
    label: "Activity",
    to: "/activity",
    icon: Activity,
  },
];

const BOTTOM_ITEMS = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help", to: "/help", icon: HelpCircle },
];

export default function Sidebar({ onClose }) {
  return (
    <div className="flex h-full w-60 flex-col bg-[#111110] text-white select-none">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8FF8B]">
            <Zap size={14} className="text-[#111110]" strokeWidth={2.5} />
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight text-white"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            DueFlow
          </span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:text-white/80 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.06]" />

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5" aria-label="Main navigation">
        <p className="px-2 pb-2 text-[10px] font-medium uppercase tracking-widest text-white/25">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-0.5">
        <div className="mx-2 mb-3 h-px bg-white/[0.06]" />
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} subtle />
        ))}

        {/* User badge */}
        <div className="mt-3 mx-1 flex items-center gap-3 rounded-lg px-2 py-2.5 bg-white/[0.04] border border-white/[0.06]">
          <div className="h-7 w-7 rounded-full bg-[#E8FF8B] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-[#111110]">SB</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-white/90 truncate">
              Small Biz Co.
            </p>
            <p className="text-[11px] text-white/35 truncate">Free plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon, end = false, subtle = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-all duration-150",
          isActive
            ? "bg-white/[0.09] text-white"
            : subtle
            ? "text-white/30 hover:bg-white/[0.05] hover:text-white/60"
            : "text-white/45 hover:bg-white/[0.05] hover:text-white/80",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={
              isActive
                ? "text-[#E8FF8B]"
                : subtle
                ? "text-white/25 group-hover:text-white/50"
                : "text-white/40 group-hover:text-white/70"
            }
          />
          <span>{label}</span>
          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#E8FF8B]" />
          )}
        </>
      )}
    </NavLink>
  );
}