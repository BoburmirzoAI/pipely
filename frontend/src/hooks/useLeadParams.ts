import { useSearchParams } from "react-router-dom";

import type { LeadListParams } from "../api/leads";
import type { LeadSource, LeadStatus } from "../lib/types";

type FollowUp = LeadListParams["follow_up"];

export interface LeadParamPatch {
  search?: string;
  status?: LeadStatus[];
  source?: LeadSource | "";
  follow_up?: FollowUp | "";
  stale?: "true" | "";
  owner?: number | "";
  ordering?: string;
  page?: number;
  page_size?: number;
}

/** Reads the lead-list query params from the URL and writes changes back. */
export function useLeadParams() {
  const [sp, setSp] = useSearchParams();

  const params: LeadListParams = {
    search: sp.get("search") || undefined,
    status: (sp.getAll("status") as LeadStatus[]) ?? [],
    source: (sp.get("source") as LeadSource) || undefined,
    follow_up: (sp.get("follow_up") as FollowUp) || undefined,
    stale: sp.get("stale") === "true" ? true : undefined,
    owner: sp.get("owner") ? Number(sp.get("owner")) : undefined,
    ordering: sp.get("ordering") || undefined,
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    page_size: sp.get("page_size") ? Number(sp.get("page_size")) : 20,
  };

  function update(patch: LeadParamPatch, opts: { resetPage?: boolean } = {}) {
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          next.delete(key);
          if (Array.isArray(value)) {
            value.forEach((v) => next.append(key, String(v)));
          } else if (value !== undefined && value !== null && value !== "") {
            next.set(key, String(value));
          }
        }
        if (opts.resetPage) next.delete("page");
        return next;
      },
      { replace: true },
    );
  }

  return { params, update, raw: sp };
}
