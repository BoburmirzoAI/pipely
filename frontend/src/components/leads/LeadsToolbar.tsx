import { useEffect, useState } from "react";

import { Icon } from "../Icon";
import { Popover } from "../Popover";
import { useDebounce } from "../../hooks/useDebounce";
import type { LeadParamPatch } from "../../hooks/useLeadParams";
import { SOURCE_META, SOURCE_ORDER, STATUS_META, STATUS_ORDER } from "../../lib/leadMeta";
import type { LeadListParams } from "../../api/leads";
import type { LeadSource, LeadStatus } from "../../lib/types";

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest first", value: "-created_at" },
  { label: "Oldest first", value: "created_at" },
  { label: "Name A–Z", value: "name" },
  { label: "Name Z–A", value: "-name" },
  { label: "Status", value: "status" },
];

const FOLLOW_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Overdue", value: "overdue" },
  { label: "Due today", value: "today" },
  { label: "Upcoming", value: "upcoming" },
  { label: "No date", value: "none" },
];

type View = "table" | "board";

export function LeadsToolbar({
  params,
  update,
  view,
  onView,
}: {
  params: LeadListParams;
  update: (patch: LeadParamPatch, opts?: { resetPage?: boolean }) => void;
  view: View;
  onView: (v: View) => void;
}) {
  // Debounced search (300ms).
  const [q, setQ] = useState(params.search ?? "");
  const debounced = useDebounce(q, 300);
  useEffect(() => {
    if ((params.search ?? "") !== debounced) {
      update({ search: debounced }, { resetPage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const activeStatus = params.status ?? [];
  const filterCount = activeStatus.length + (params.source ? 1 : 0);

  return (
    <div className="flex flex-none flex-wrap items-center gap-2.5 border-b border-line px-5 py-3">
      {/* View toggle */}
      <div className="flex rounded-md border border-line bg-[#F3F4F6] p-0.5">
        <ToggleBtn active={view === "table"} onClick={() => onView("table")} icon="table">
          Table
        </ToggleBtn>
        <ToggleBtn active={view === "board"} onClick={() => onView("board")} icon="columns">
          Board
        </ToggleBtn>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5">
        <Icon name="search" size={15} stroke="#9CA3AF" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search leads…"
          className="w-40 bg-transparent text-[13px] text-ink outline-none placeholder:text-gray-400 sm:w-52"
        />
      </div>

      {/* Filter */}
      <Popover
        width={230}
        trigger={() => (
          <button
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] font-medium ${
              filterCount
                ? "border-brand bg-brand-light text-brand"
                : "border-line bg-white text-gray-700 hover:bg-[#FAFAFB]"
            }`}
          >
            <Icon name="filter" size={14} />
            Filter
            {filterCount > 0 && (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                {filterCount}
              </span>
            )}
            <Icon name="chevdown" size={13} />
          </button>
        )}
      >
        {() => (
          <FilterMenu
            status={activeStatus}
            source={params.source}
            onChange={(patch) => update(patch, { resetPage: true })}
          />
        )}
      </Popover>

      {/* Sort */}
      <Popover
        width={170}
        trigger={() => (
          <ToolbarBtn icon="sort">Sort</ToolbarBtn>
        )}
      >
        {(close) => (
          <Menu
            options={SORT_OPTIONS}
            active={params.ordering ?? "-created_at"}
            onPick={(value) => {
              update({ ordering: value }, { resetPage: true });
              close();
            }}
          />
        )}
      </Popover>

      {/* Follow-up */}
      <Popover
        width={170}
        trigger={() => (
          <ToolbarBtn icon="clock">Follow-up</ToolbarBtn>
        )}
      >
        {(close) => (
          <Menu
            options={FOLLOW_OPTIONS}
            active={params.follow_up ?? ""}
            onPick={(value) => {
              update({ follow_up: value as LeadParamPatch["follow_up"] }, { resetPage: true });
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: "table" | "columns";
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"
      }`}
    >
      <Icon name={icon} size={14} />
      {children}
    </button>
  );
}

function ToolbarBtn({ icon, children }: { icon: "sort" | "clock"; children: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-[#FAFAFB]">
      <Icon name={icon} size={14} />
      {children}
      <Icon name="chevdown" size={13} />
    </button>
  );
}

function Menu({
  options,
  active,
  onPick,
}: {
  options: { label: string; value: string }[];
  active: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onPick(o.value)}
          className="flex items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
        >
          {o.label}
          {o.value === active && <Icon name="check" size={14} stroke="#4F46E5" strokeWidth={2.4} />}
        </button>
      ))}
    </div>
  );
}

function FilterMenu({
  status,
  source,
  onChange,
}: {
  status: LeadStatus[];
  source?: LeadSource;
  onChange: (patch: LeadParamPatch) => void;
}) {
  function toggleStatus(s: LeadStatus) {
    const next = status.includes(s) ? status.filter((x) => x !== s) : [...status, s];
    onChange({ status: next });
  }

  return (
    <div className="flex flex-col">
      <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Status
      </div>
      {STATUS_ORDER.map((s) => {
        const checked = status.includes(s);
        return (
          <label
            key={s}
            className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-[13px] hover:bg-[#F6F6F7]"
          >
            <span
              className="flex h-4 w-4 flex-none items-center justify-center rounded border"
              style={
                checked
                  ? { background: "#4F46E5", borderColor: "#4F46E5" }
                  : { borderColor: "#D1D5DB" }
              }
            >
              {checked && <Icon name="check" size={11} stroke="#fff" strokeWidth={3} />}
            </span>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_META[s].dot }} />
            <span className="flex-1">{STATUS_META[s].label}</span>
            <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleStatus(s)} />
          </label>
        );
      })}

      <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Source
      </div>
      {SOURCE_ORDER.map((s) => (
        <button
          key={s}
          onClick={() => onChange({ source: source === s ? "" : s })}
          className="flex items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name={SOURCE_META[s].icon} size={14} stroke="#6B7280" />
            {SOURCE_META[s].label}
          </span>
          {source === s && <Icon name="check" size={14} stroke="#4F46E5" strokeWidth={2.4} />}
        </button>
      ))}

      <div className="mt-1 border-t border-line px-1 pt-1.5">
        <button
          onClick={() => onChange({ status: [], source: "" })}
          className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:text-ink"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
