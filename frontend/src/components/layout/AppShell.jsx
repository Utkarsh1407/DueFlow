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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  return (
    <div className="flex h-screen bg-[var(--color-bg-app)] overflow-hidden">
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
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggle}
        />
        <main className="flex-1 overflow-y-auto bg-[var(--color-bg-app)]">
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