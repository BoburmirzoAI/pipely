import { Icon } from "../Icon";
import { formatFollowUp } from "../../lib/format";
import type { Lead } from "../../lib/types";

function Badge({ bg, color, children }: { bg: string; color: string; children: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-1.5 py-px text-[11px] font-semibold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

export function FollowUpCell({ lead }: { lead: Lead }) {
  if (!lead.next_follow_up_at) {
    return <span className="text-gray-300">—</span>;
  }
  const color = lead.is_overdue ? "#B91C1C" : lead.is_due_today ? "#B45309" : "#374151";
  return (
    <span className="inline-flex items-center gap-2 text-[13px]" style={{ color }}>
      <span className="inline-flex items-center gap-1.5">
        {(lead.is_overdue || lead.is_due_today) && (
          <Icon name="clock" size={13} stroke={lead.is_overdue ? "#DC2626" : "#D97706"} />
        )}
        {formatFollowUp(lead.next_follow_up_at)}
      </span>
      {lead.is_overdue && <Badge bg="#FEE2E2" color="#B91C1C">Overdue</Badge>}
      {!lead.is_overdue && lead.is_due_today && <Badge bg="#FEF3C7" color="#B45309">Today</Badge>}
    </span>
  );
}
