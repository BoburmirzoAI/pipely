import type { IconName } from "../components/Icon";
import type { LeadSource, LeadStatus } from "./types";

// Status colors taken directly from the design.
export const STATUS_META: Record<
  LeadStatus,
  { label: string; dot: string; pillBg: string; pillText: string }
> = {
  new: { label: "New", dot: "#9CA3AF", pillBg: "#F3F4F6", pillText: "#374151" },
  contacted: { label: "Contacted", dot: "#3B82F6", pillBg: "#EFF6FF", pillText: "#1D4ED8" },
  qualified: { label: "Qualified", dot: "#8B5CF6", pillBg: "#F5F3FF", pillText: "#6D28D9" },
  won: { label: "Won", dot: "#22C55E", pillBg: "#ECFDF3", pillText: "#15803D" },
  lost: { label: "Lost", dot: "#EF4444", pillBg: "#FEF2F2", pillText: "#B91C1C" },
};

export const SOURCE_META: Record<LeadSource, { label: string; icon: IconName }> = {
  website: { label: "Website", icon: "globe" },
  instagram: { label: "Instagram", icon: "instagram" },
  telegram: { label: "Telegram", icon: "send" },
  referral: { label: "Referral", icon: "user" },
  other: { label: "Other", icon: "more" },
};

export const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
];

export const SOURCE_ORDER: LeadSource[] = [
  "website",
  "instagram",
  "telegram",
  "referral",
  "other",
];
