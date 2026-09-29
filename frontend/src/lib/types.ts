export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type LeadSource =
  | "website"
  | "instagram"
  | "telegram"
  | "referral"
  | "other";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  date_joined: string;
}

export type PermissionCode =
  | "leads.view"
  | "leads.view_all"
  | "leads.create"
  | "leads.update"
  | "leads.update_status"
  | "leads.delete"
  | "leads.assign"
  | "stats.view"
  | "users.view"
  | "rbac.manage";

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  note: string;
  status: LeadStatus;
  next_follow_up_at: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
  is_stale: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: number;
  type: "created" | "updated" | "status_changed";
  field: string;
  old_value: string;
  new_value: string;
  user: number | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

export interface Stats {
  total: number;
  by_status: Record<LeadStatus, number>;
  conversion_rate: number | null;
  follow_ups: { overdue: number; today: number; upcoming: number };
  stale: number;
}

export interface ApiError {
  error: { code: string; message: string; details: Record<string, unknown> };
}

export interface DuplicateHit {
  duplicate: { id: number; name: string; matched_on: "email" | "phone" } | null;
}
