import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { leadsApi } from "../api/leads";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { LeadFormModal } from "../components/leads/LeadFormModal";
import { LeadsBoard } from "../components/leads/LeadsBoard";
import { LeadsTable } from "../components/leads/LeadsTable";
import { LeadsToolbar } from "../components/leads/LeadsToolbar";
import { Pagination } from "../components/leads/Pagination";
import { useLeadParams } from "../hooks/useLeadParams";
import { apiError } from "../lib/errors";

type View = "table" | "board";

export function Leads() {
  const { params, update } = useLeadParams();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("table");
  const [creating, setCreating] = useState(false);

  const query = useQuery({
    queryKey: ["leads", params],
    queryFn: () => leadsApi.list(params),
    placeholderData: keepPreviousData,
  });

  const ordering = params.ordering ?? "-created_at";
  const hasFilters = Boolean(
    params.search || (params.status?.length ?? 0) || params.source || params.follow_up,
  );

  function onSort(field: string) {
    update({ ordering: ordering === field ? `-${field}` : field }, { resetPage: true });
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        icon="users"
        title="Leads"
        action={
          <button className="btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" size={15} strokeWidth={2.2} />
            New lead
          </button>
        }
      />
      <LeadsToolbar params={params} update={update} view={view} onView={setView} />

      <div className="flex-1 overflow-auto">
        {view === "board" ? (
          <LeadsBoard params={params} onCard={(id) => navigate(`/leads/${id}`)} />
        ) : query.isLoading ? (
          <Centered>Loading leads…</Centered>
        ) : query.isError ? (
          <ErrorState message={apiError(query.error).message} onRetry={() => query.refetch()} />
        ) : query.data && query.data.data.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={() => update({ search: "", status: [], source: "", follow_up: "" }, { resetPage: true })}
            onCreate={() => setCreating(true)}
          />
        ) : (
          <LeadsTable
            leads={query.data!.data}
            ordering={ordering}
            onSort={onSort}
            onRowClick={(id) => navigate(`/leads/${id}`)}
          />
        )}
      </div>

      {view === "table" && query.data && query.data.data.length > 0 && (
        <Pagination
          page={query.data.meta.page}
          pageSize={query.data.meta.page_size}
          total={query.data.meta.total}
          totalPages={query.data.meta.total_pages}
          onPage={(n) => update({ page: n })}
          onPageSize={(n) => update({ page_size: n }, { resetPage: true })}
        />
      )}

      {creating && (
        <LeadFormModal
          onClose={() => setCreating(false)}
          onSaved={(lead) => {
            setCreating(false);
            navigate(`/leads/${lead.id}`);
          }}
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      {children}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Icon name="alert" size={28} stroke="#DC2626" />
      <div className="text-sm text-gray-600">{message}</div>
      <button className="btn-secondary" onClick={onRetry}>
        <Icon name="refresh" size={14} />
        Retry
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Icon name="inbox" size={30} stroke="#9CA3AF" />
      <div className="text-sm font-medium text-gray-600">
        {hasFilters ? "No leads match your filters." : "No leads yet."}
      </div>
      {hasFilters ? (
        <button className="btn-secondary" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        <button className="btn-primary" onClick={onCreate}>
          <Icon name="plus" size={15} strokeWidth={2.2} />
          New lead
        </button>
      )}
    </div>
  );
}
