import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Icon } from "./Icon";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full bg-white">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile slide-over sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/28"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with menu toggle */}
        <div className="flex h-14 flex-none items-center gap-3 border-b border-line px-4 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-ink">
            <Icon name="menu" size={20} />
          </button>
          <span className="font-semibold">Pipely</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
