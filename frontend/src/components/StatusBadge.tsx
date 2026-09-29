import { STATUS_META } from "../lib/leadMeta";
import type { LeadStatus } from "../lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: m.pillBg, color: m.pillText }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: m.dot }}
      />
      {m.label}
    </span>
  );
}

export function StatusDot({ status }: { status: LeadStatus }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: STATUS_META[status].dot }}
    />
  );
}
