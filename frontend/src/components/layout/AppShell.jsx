import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { setTokenGetter } from "../../lib/api";
import Sidebar   from "./Sidebar";
import TopBar    from "./TopBar";
import MobileNav from "./MobileNav";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getToken } = useAuth();

  // Register Clerk's getToken so axios can attach it automatically
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return (
    <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex w-64 flex-shrink-0">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}