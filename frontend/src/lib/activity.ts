import { STATUS_META } from "./leadMeta";
import type { LeadActivity, LeadStatus } from "./types";

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  source: "Source",
  note: "Note",
  next_follow_up_at: "Follow-up",
  status: "Status",
};

function statusLabel(value: string) {
  return STATUS_META[value as LeadStatus]?.label ?? value;
}

export interface ActivityView {
  text: string;
  icon: "plus" | "clock" | "pencil" | "phone" | "mail";
  dotColor?: string; // when the marker is a colored dot (status change)
}

/** Human-readable description + marker for one activity row. */
export function describeActivity(a: LeadActivity): ActivityView {
  if (a.type === "created") {
    return { text: "Lead created", icon: "plus" };
  }
  if (a.type === "status_changed") {
    return {
      text: `Status changed from ${statusLabel(a.old_value)} to ${statusLabel(a.new_value)}`,
      icon: "clock",
      dotColor: STATUS_META[a.new_value as LeadStatus]?.dot,
    };
  }
  // updated
  if (a.field === "next_follow_up_at" && !a.new_value) {
    return { text: "Follow-up cleared", icon: "clock" };
  }
  const label = FIELD_LABELS[a.field] ?? a.field;
  const icon = a.field === "phone" ? "phone" : a.field === "email" ? "mail" : "pencil";
  return { text: `${label} updated`, icon };
}
