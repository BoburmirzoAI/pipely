import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";

import { leadsApi } from "../api/leads";
import { useAuth } from "../auth/AuthContext";
import { Icon } from "./Icon";
import { Wordmark } from "./Logo";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-[#ECECEE] text-ink" : "text-gray-500 hover:bg-[#F0F0F1] hover:text-ink",
  ].join(" ");

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: leadsApi.stats,
    staleTime: 60_000,
  });

  const name =
    user && (user.first_name || user.last_name)
      ? `${user.first_name} ${user.last_name}`.trim()
      : user?.username ?? "";

  return (
    <aside className="flex h-full w-60 flex-none flex-col border-r border-line bg-[#FAFAFA] px-3 pb-3 pt-3.5">
      <div className="px-2 pb-4 pt-1">
        <Wordmark />
      </div>

      <nav className="flex flex-col gap-0.5" onClick={onNavigate}>
        <NavLink to="/dashboard" className={navItemClass}>
          <Icon name="dash" />
          <span className="flex-1">Dashboard</span>
        </NavLink>
        <NavLink to="/leads" className={navItemClass}>
          {({ isActive }) => (
            <>
              <Icon name="users" stroke={isActive ? "#4F46E5" : "currentColor"} />
              <span className="flex-1">Leads</span>
              {stats && (
                <span className="rounded-md border border-line bg-white px-1.5 py-px text-[11px] font-semibold text-gray-500">
                  {stats.total}
                </span>
              )}
            </>
          )}
        </NavLink>
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-line px-1.5 pb-1 pt-2.5">
        <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
          {initials(name || "U")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-ink">{name}</div>
          <div className="text-[11.5px] text-gray-400">Admin</div>
        </div>
        <button
          onClick={logout}
          title="Log out"
          className="flex p-1 text-gray-400 hover:text-ink"
        >
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
