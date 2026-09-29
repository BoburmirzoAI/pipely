import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { leadsApi } from "../api/leads";
import { useAuth } from "../auth/AuthContext";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { STATUS_META, STATUS_ORDER } from "../lib/leadMeta";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: leadsApi.stats,
  });

  const firstName = user?.first_name || user?.username || "";
  const conversion =
    stats?.conversion_rate == null ? "—" : `${Math.round(stats.conversion_rate * 100)}%`;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        icon="dash"
        title="Dashboard"
        action={
          <button className="btn-primary" onClick={() => navigate("/leads")}>
            <Icon name="plus" size={15} strokeWidth={2.2} />
            New lead
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="text-xl font-semibold text-ink">
          {greeting()}
          {firstName && `, ${firstName}`}
        </div>
        <div className="mt-0.5 text-[13px] text-gray-500">
          Here's what's happening in your pipeline today.
        </div>

        {isLoading || !stats ? (
          <div className="mt-8 text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Follow-up alert cards */}
            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <AlertCard
                to="/leads?follow_up=overdue"
                border="#FECACA"
                bg="#FEF2F2"
                iconBg="#FEE2E2"
                iconStroke="#DC2626"
                labelColor="#B91C1C"
                label="Overdue follow-ups"
                value={stats.follow_ups.overdue}
              />
              <AlertCard
                to="/leads?follow_up=today"
                border="#FDE68A"
                bg="#FFFBEB"
                iconBg="#FEF3C7"
                iconStroke="#D97706"
                labelColor="#B45309"
                label="Due today"
                value={stats.follow_ups.today}
              />
            </div>

            {/* Stat cards */}
            <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
              <StatCard label="Total leads" value={stats.total} />
              <StatCard label="Upcoming" value={stats.follow_ups.upcoming} />
              <StatCard label="Won" value={stats.by_status.won} dot="#22C55E" valueColor="#15803D" />
              <StatCard label="Lost" value={stats.by_status.lost} dot="#EF4444" valueColor="#B91C1C" />
              <StatCard label="Conversion rate" value={conversion} />
            </div>

            {/* Leads by status */}
            <div className="mt-4 rounded-xl border border-line p-4">
              <div className="text-[13.5px] font-semibold text-ink">Leads by status</div>
              <div className="mt-3 flex flex-col gap-2.5">
                {STATUS_ORDER.map((s) => {
                  const count = stats.by_status[s];
                  const pct = stats.total ? (count / stats.total) * 100 : 0;
                  const meta = STATUS_META[s];
                  return (
                    <Link
                      key={s}
                      to={`/leads?status=${s}`}
                      className="flex items-center gap-3 text-[13px] hover:opacity-80"
                    >
                      <span className="flex w-24 flex-none items-center gap-2 text-gray-600">
                        <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${pct}%`, background: meta.dot }}
                        />
                      </span>
                      <span className="w-8 flex-none text-right font-semibold text-ink">
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  to,
  border,
  bg,
  iconBg,
  iconStroke,
  labelColor,
  label,
  value,
}: {
  to: string;
  border: string;
  bg: string;
  iconBg: string;
  iconStroke: string;
  labelColor: string;
  label: string;
  value: number;
}) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-xl p-4"
      style={{ border: `1px solid ${border}`, background: bg }}
    >
      <span
        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px]"
        style={{ background: iconBg }}
      >
        <Icon name="clock" size={18} stroke={iconStroke} />
      </span>
      <div className="flex-1">
        <div className="text-xs font-medium" style={{ color: labelColor }}>
          {label}
        </div>
        <div className="mt-0.5 text-2xl font-semibold" style={{ color: labelColor }}>
          {value}
        </div>
      </div>
      <Link to={to} className="text-[12.5px] font-semibold" style={{ color: labelColor }}>
        View
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  dot,
  valueColor,
}: {
  label: string;
  value: number | string;
  dot?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {dot && <span className="h-[7px] w-[7px] rounded-full" style={{ background: dot }} />}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold" style={{ color: valueColor ?? "#111" }}>
        {value}
      </div>
    </div>
  );
}
