import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { LeadListParams } from "../../api/leads";
import { leadsApi } from "../../api/leads";
import { formatFollowUp, formatRelative } from "../../lib/format";
import { SOURCE_META, STATUS_META, STATUS_ORDER } from "../../lib/leadMeta";
import type { Lead, LeadStatus } from "../../lib/types";
import { Avatar } from "../Avatar";
import { Icon } from "../Icon";
import { StaleBadge } from "./StaleBadge";

export function LeadsBoard({
  params,
  onCard,
}: {
  params: LeadListParams;
  onCard: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  const query = useQuery({
    queryKey: ["leads-board", params],
    queryFn: () => leadsApi.list({ ...params, page: 1, page_size: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LeadStatus }) =>
      leadsApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Loading board…
      </div>
    );
  }

  const leads = query.data?.data ?? [];
  const byStatus = (s: LeadStatus) => leads.filter((l) => l.status === s);

  function onDrop(status: LeadStatus) {
    setDragOver(null);
    const id = draggedId;
    draggedId = null;
    const lead = leads.find((l) => l.id === id);
    if (lead && lead.status !== status) {
      statusMutation.mutate({ id: lead.id, status });
    }
  }

  return (
    <div className="flex h-full gap-3.5 overflow-auto bg-[#FBFBFC] p-5">
      {STATUS_ORDER.map((status) => {
        const items = byStatus(status);
        const meta = STATUS_META[status];
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={() => onDrop(status)}
            className={`flex w-56 flex-none flex-col gap-2.5 rounded-lg p-1 ${
              dragOver === status ? "bg-[#F5F3FF] ring-1 ring-[#C4B5FD]" : ""
            }`}
          >
            <div className="flex items-center gap-2 px-1 py-0.5">
              <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
              <span className="text-[13px] font-semibold text-ink">{meta.label}</span>
              <span className="rounded-full bg-[#F3F4F6] px-2 py-px text-xs font-semibold text-gray-500">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((lead) => (
                <BoardCard key={lead.id} lead={lead} onClick={() => onCard(lead.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Simple module-level handle for the dragged lead id (native DnD).
let draggedId: number | null = null;

function BoardCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const src = SOURCE_META[lead.source];
  const contact = lead.email || lead.phone;
  const fuColor = lead.is_overdue ? "#B91C1C" : lead.is_due_today ? "#D97706" : "#6B7280";

  return (
    <div
      draggable
      onDragStart={() => (draggedId = lead.id)}
      onClick={onClick}
      className="flex cursor-grab flex-col gap-2 rounded-lg border border-line bg-white p-2.5 hover:border-[#D6D6DC] hover:shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={lead.name} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
          {lead.name}
        </span>
        {lead.is_stale && <StaleBadge />}
      </div>
      {contact && (
        <div className="truncate text-xs text-gray-500">{contact}</div>
      )}
      {lead.next_follow_up_at && (
        <div className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: fuColor }}>
          <Icon name="clock" size={12} />
          {formatFollowUp(lead.next_follow_up_at)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <Icon name={src.icon} size={13} stroke="#9CA3AF" />
          {src.label}
        </span>
        <span className="text-xs text-gray-400">{formatRelative(lead.created_at)}</span>
      </div>
    </div>
  );
}
