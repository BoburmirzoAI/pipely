import { Icon } from "../Icon";
import { Avatar } from "../Avatar";
import { StatusBadge } from "../StatusBadge";
import { FollowUpCell } from "./FollowUpCell";
import { StaleBadge } from "./StaleBadge";
import { formatRelative } from "../../lib/format";
import { SOURCE_META } from "../../lib/leadMeta";
import type { Lead } from "../../lib/types";

export function LeadsTable({
  leads,
  ordering,
  onSort,
  onRowClick,
  showOwner = false,
}: {
  leads: Lead[];
  ordering?: string;
  onSort: (field: string) => void;
  onRowClick: (id: number) => void;
  showOwner?: boolean;
}) {
  const activeField = ordering?.replace(/^-/, "");
  const desc = ordering?.startsWith("-");

  const columns: { label: string; field?: string }[] = [
    { label: "Name", field: "name" },
    { label: "Email" },
    { label: "Phone" },
    { label: "Source" },
    ...(showOwner ? [{ label: "Owner" }] : []),
    { label: "Status", field: "status" },
    { label: "Follow-up", field: "next_follow_up_at" },
    { label: "Created", field: "created_at" },
  ];

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-line">
          {columns.map((col) => {
            const active = col.field && col.field === activeField;
            return (
              <th
                key={col.label}
                onClick={col.field ? () => onSort(col.field!) : undefined}
                className={`px-3.5 py-2.5 text-left text-xs font-semibold ${
                  col.field ? "cursor-pointer select-none" : ""
                } ${active ? "text-ink" : "text-gray-500"}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  {active && (
                    <Icon name={desc ? "chevdown" : "chevup"} size={13} stroke="#4F46E5" strokeWidth={2.4} />
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const src = SOURCE_META[lead.source];
          return (
            <tr
              key={lead.id}
              onClick={() => onRowClick(lead.id)}
              className="cursor-pointer border-b border-[#F1F1F3] hover:bg-[#FAFAFB]"
            >
              <td className="px-3.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={lead.name} />
                  <span className="text-[13px] font-medium text-ink">{lead.name}</span>
                </div>
              </td>
              <td className="px-3.5 py-2.5 text-[13px] text-gray-600">
                {lead.email || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-3.5 py-2.5 text-[13px] text-gray-600">
                {lead.phone || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-3.5 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-700">
                  <Icon name={src.icon} size={14} stroke="#6B7280" />
                  {src.label}
                </span>
              </td>
              {showOwner && (
                <td className="px-3.5 py-2.5 text-[13px] text-gray-600">
                  {lead.owner.username}
                </td>
              )}
              <td className="px-3.5 py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <StatusBadge status={lead.status} />
                  {lead.is_stale && <StaleBadge />}
                </span>
              </td>
              <td className="px-3.5 py-2.5">
                <FollowUpCell lead={lead} />
              </td>
              <td className="px-3.5 py-2.5 text-[13px] text-gray-500">
                {formatRelative(lead.created_at)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
