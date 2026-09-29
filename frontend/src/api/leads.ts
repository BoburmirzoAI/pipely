import type {
  DuplicateHit,
  Lead,
  LeadActivity,
  LeadSource,
  LeadStatus,
  Paginated,
  Stats,
} from "../lib/types";
import { api } from "./client";

export interface LeadListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: LeadStatus[];
  source?: LeadSource;
  follow_up?: "overdue" | "today" | "upcoming" | "none";
  ordering?: string;
}

export interface LeadWrite {
  name: string;
  email?: string;
  phone?: string;
  source?: LeadSource;
  note?: string;
  next_follow_up_at?: string | null;
}

export const leadsApi = {
  list(params: LeadListParams) {
    return api
      .get<Paginated<Lead>>("/leads/", { params })
      .then((r) => r.data);
  },
  get(id: number) {
    return api.get<Lead>(`/leads/${id}/`).then((r) => r.data);
  },
  create(data: LeadWrite) {
    return api.post<Lead>("/leads/", data).then((r) => r.data);
  },
  update(id: number, data: Partial<LeadWrite>) {
    return api.patch<Lead>(`/leads/${id}/`, data).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/leads/${id}/`).then(() => undefined);
  },
  setStatus(id: number, status: LeadStatus) {
    return api.patch<Lead>(`/leads/${id}/status/`, { status }).then((r) => r.data);
  },
  checkDuplicate(email: string, phone: string) {
    return api
      .get<DuplicateHit>("/leads/check-duplicate/", { params: { email, phone } })
      .then((r) => r.data);
  },
  activities(id: number) {
    return api
      .get<LeadActivity[]>(`/leads/${id}/activities/`)
      .then((r) => r.data);
  },
  stats() {
    return api.get<Stats>("/leads/stats/").then((r) => r.data);
  },
};
