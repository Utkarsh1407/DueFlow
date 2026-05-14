import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Invoices", to: "/invoices", icon: FileText },
  { label: "Reminders", to: "/reminders", icon: Bell },
  { label: "Activity", to: "/activity", icon: Activity },
];

export default function MobileNav() {
  return (
    <nav
      className="flex items-stretch border-t border-[#E8E8E4] bg-[#F7F7F5]"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors duration-150",
              isActive
                ? "text-[#111110]"
                : "text-[#AAAA9F] hover:text-[#888880]",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex items-center justify-center h-7 w-10 rounded-xl transition-all duration-150 ${
                  isActive ? "bg-[#111110]" : "bg-transparent"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? "text-[#E8FF8B]" : "text-[#AAAA9F]"}
                />
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}