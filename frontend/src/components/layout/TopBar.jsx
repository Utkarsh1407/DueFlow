import { useLocation, Link } from "react-router-dom";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROUTE_META = {
  "/": { title: "Dashboard", crumbs: [] },
  "/invoices": { title: "Invoices", crumbs: ["Invoices"] },
  "/invoices/new": { title: "New Invoice", crumbs: ["Invoices", "New"] },
  "/reminders": { title: "Reminders", crumbs: ["Reminders"] },
  "/activity": { title: "Activity", crumbs: ["Activity"] },
  "/settings": { title: "Settings", crumbs: ["Settings"] },
};

function useRouteMeta() {
  const { pathname } = useLocation();

  // Match edit route like /invoices/:id/edit
  if (/^\/invoices\/.+\/edit$/.test(pathname)) {
    return { title: "Edit Invoice", crumbs: ["Invoices", "Edit"] };
  }
  // Match detail route like /invoices/:id
  if (/^\/invoices\/.+$/.test(pathname)) {
    return { title: "Invoice Detail", crumbs: ["Invoices", "Detail"] };
  }

  return ROUTE_META[pathname] ?? { title: "DueFlow", crumbs: [] };
}

export default function TopBar({ onMenuClick }) {
  const { title, crumbs } = useRouteMeta();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="flex h-14 flex-shrink-0 items-center border-b border-[#E8E8E4] bg-[#F7F7F5] px-4 sm:px-6 gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-[#888880] hover:bg-[#EFEFEB] hover:text-[#111110] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Page title / breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0 mr-auto">
        {crumbs.length > 0 ? (
          <>
            <span className="text-[13px] text-[#AAAA9F] hidden sm:block">
              DueFlow
            </span>
            {crumbs.map((crumb, i) => (
              <span key={i} className="hidden sm:flex items-center gap-1.5">
                <span className="text-[13px] text-[#CCCCBF]">/</span>
                <span
                  className={`text-[13px] ${
                    i === crumbs.length - 1
                      ? "text-[#111110] font-medium"
                      : "text-[#AAAA9F]"
                  }`}
                >
                  {crumb}
                </span>
              </span>
            ))}
            {/* Mobile: just show title */}
            <span className="text-[14px] font-semibold text-[#111110] sm:hidden">
              {title}
            </span>
          </>
        ) : (
          <span className="text-[14px] font-semibold text-[#111110]">
            {title}
          </span>
        )}
      </div>

      {/* Search bar — hidden on very small screens */}
      <div className="hidden sm:flex relative">
        <div
          className={`flex items-center gap-2 rounded-lg border bg-white px-3 h-8 transition-all duration-150 ${
            searchFocused
              ? "border-[#111110] w-52"
              : "border-[#E0E0D8] w-40 hover:border-[#C8C8C0]"
          }`}
        >
          <Search
            size={13}
            className="text-[#AAAA9F] flex-shrink-0"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search invoices..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-[12.5px] text-[#111110] placeholder:text-[#BCBCB0] outline-none min-w-0"
          />
          <kbd className="hidden sm:flex items-center justify-center text-[10px] text-[#CCCCBF] font-medium border border-[#E0E0D8] rounded px-1 py-0.5 leading-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* New Invoice quick action */}
        <button
          onClick={() => navigate("/invoices/new")}
          className="flex items-center gap-1.5 rounded-lg bg-[#111110] px-3 h-8 text-[12.5px] font-medium text-white hover:bg-[#2A2A28] transition-colors"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Invoice</span>
        </button>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center h-8 w-8 rounded-lg text-[#888880] hover:bg-[#EFEFEB] hover:text-[#111110] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.8} />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#E8FF8B] border border-[#F7F7F5]" />
        </button>
      </div>
    </header>
  );
}