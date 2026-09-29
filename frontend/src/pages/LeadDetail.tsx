import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { leadsApi } from "../api/leads";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { AssignSelect } from "../components/leads/AssignSelect";
import { DeleteDialog } from "../components/leads/DeleteDialog";
import { LeadFormModal } from "../components/leads/LeadFormModal";
import { StatusSelect } from "../components/leads/StatusSelect";
import { useToast } from "../components/Toast";
import { usePermissions } from "../hooks/usePermissions";
import { StatusBadge } from "../components/StatusBadge";
import { describeActivity } from "../lib/activity";
import { apiError } from "../lib/errors";
import { formatDateTime, formatRelative } from "../lib/format";
import { SOURCE_META } from "../lib/leadMeta";
import type { Lead, LeadStatus } from "../lib/types";

export function LeadDetail() {
  const { id } = useParams();
  const leadId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { has } = usePermissions();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => leadsApi.get(leadId),
  });
  const activitiesQuery = useQuery({
    queryKey: ["activities", leadId],
    queryFn: () => leadsApi.activities(leadId),
    enabled: leadQuery.isSuccess,
  });

  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => leadsApi.setStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.show("Status updated");
    },
    onError: (err) => toast.show(apiError(err).message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => leadsApi.remove(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.show("Lead deleted");
      navigate("/leads");
    },
    onError: (err) => toast.show(apiError(err).message, "error"),
  });

  const assignMutation = useMutation({
    mutationFn: (ownerId: number) => leadsApi.assign(leadId, ownerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", leadId] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.show("Lead reassigned");
    },
    onError: (err) => toast.show(apiError(err).message, "error"),
  });

  if (leadQuery.isLoading) {
    return <Center>Loading…</Center>;
  }
  if (leadQuery.isError || !leadQuery.data) {
    return (
      <Center>
        <div className="flex flex-col items-center gap-3">
          <Icon name="alert" size={28} stroke="#DC2626" />
          <div className="text-sm text-gray-600">{apiError(leadQuery.error).message}</div>
          <Link to="/leads" className="btn-secondary">
            Back to leads
          </Link>
        </div>
      </Center>
    );
  }

  const lead = leadQuery.data;
  const ownerName = lead.owner.username;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex h-14 flex-none items-center border-b border-line px-6 text-[13px] font-medium">
        <Link to="/leads" className="text-gray-500 hover:text-ink">
          Leads
        </Link>
        <span className="px-1.5 text-gray-300">/</span>
        <span className="font-semibold text-ink">{lead.name}</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <Avatar name={lead.name} size={52} />
            <div>
              <div className="text-xl font-semibold text-ink">{lead.name}</div>
              <div className="mt-0.5 text-[13px] text-gray-500">
                {[lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact info"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {has("leads.update_status") ? (
              <StatusSelect value={lead.status} onChange={(s) => statusMutation.mutate(s)} />
            ) : (
              <StatusBadge status={lead.status} />
            )}
            {has("leads.assign") && (
              <AssignSelect
                currentOwnerId={lead.owner.id}
                onAssign={(id) => assignMutation.mutate(id)}
              />
            )}
            {has("leads.update") && (
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                <Icon name="pencil" size={14} />
                Edit
              </button>
            )}
            {has("leads.delete") && (
              <button
                onClick={() => setDeleting(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-[#B91C1C] hover:border-[#FCA5A5] hover:bg-[#FEF2F2]"
              >
                <Icon name="trash" size={14} />
                Delete
              </button>
            )}
          </div>
        </div>

        {lead.is_stale && (
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-4 py-2.5 text-[13px] text-gray-600">
            <Icon name="alert" size={15} stroke="#6B7280" />
            No activity for {Math.floor(
              (Date.now() - new Date(lead.updated_at).getTime()) / 86400000,
            )}{" "}
            days — set a follow-up or update the status.
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-2">
          {/* Details */}
          <div>
            <SectionTitle>Details</SectionTitle>
            <div className="flex flex-col">
              <Row label="Name">{lead.name}</Row>
              <Row label="Email">{lead.email || <Muted />}</Row>
              <Row label="Phone">{lead.phone || <Muted />}</Row>
              <Row label="Source">
                <span className="inline-flex items-center gap-2">
                  <Icon name={SOURCE_META[lead.source].icon} size={14} stroke="#6B7280" />
                  {SOURCE_META[lead.source].label}
                </span>
              </Row>
              <Row label="Next follow-up">
                <FollowUp lead={lead} />
              </Row>
              <Row label="Note">
                {lead.note ? (
                  <span className="leading-relaxed text-gray-700">{lead.note}</span>
                ) : (
                  <Muted />
                )}
              </Row>
              <Row label="Owner">
                <span className="inline-flex items-center gap-2">
                  <Avatar name={ownerName} size={22} />
                  {ownerName}
                </span>
              </Row>
              <Row label="Created">{formatDateTime(lead.created_at)}</Row>
              <Row label="Updated" last>
                {formatRelative(lead.updated_at)}
              </Row>
            </div>
          </div>

          {/* Activity */}
          <div>
            <SectionTitle>Activity</SectionTitle>
            {activitiesQuery.data && activitiesQuery.data.length > 0 ? (
              <div className="flex flex-col">
                {activitiesQuery.data.map((a, i) => {
                  const v = describeActivity(a);
                  const last = i === activitiesQuery.data!.length - 1;
                  return (
                    <div key={a.id} className="relative flex gap-3 pb-5">
                      {!last && (
                        <span className="absolute left-[11px] top-6 bottom-0 w-px bg-line" />
                      )}
                      <span
                        className="z-[1] flex h-6 w-6 flex-none items-center justify-center rounded-full"
                        style={{ background: "#F3F4F6" }}
                      >
                        {v.dotColor ? (
                          <span className="h-2 w-2 rounded-full" style={{ background: v.dotColor }} />
                        ) : (
                          <Icon name={v.icon} size={12} stroke="#6B7280" />
                        )}
                      </span>
                      <div className="pt-0.5">
                        <div className="text-[13px] leading-snug text-ink">{v.text}</div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          {formatRelative(a.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[13px] text-gray-400">No activity yet.</div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <LeadFormModal
          lead={lead}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}
      {deleting && (
        <DeleteDialog
          leadName={lead.name}
          busy={deleteMutation.isPending}
          onCancel={() => setDeleting(false)}
          onConfirm={() => deleteMutation.mutate()}
        />
      )}
    </div>
  );
}

function Center({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-500">{children}</div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

function Row({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex py-2.5 text-[13px] ${last ? "" : "border-b border-[#F1F1F3]"}`}>
      <span className="w-24 flex-none text-gray-500">{label}</span>
      <span className="font-medium text-ink">{children}</span>
    </div>
  );
}

function Muted() {
  return <span className="text-gray-300">—</span>;
}

function FollowUp({ lead }: { lead: Lead }) {
  if (!lead.next_follow_up_at) return <Muted />;
  const color = lead.is_overdue ? "#B91C1C" : lead.is_due_today ? "#B45309" : "#111";
  return (
    <span className="inline-flex items-center gap-2" style={{ color }}>
      <Icon
        name="clock"
        size={14}
        stroke={lead.is_overdue ? "#DC2626" : lead.is_due_today ? "#D97706" : "#6B7280"}
      />
      {formatDateTime(lead.next_follow_up_at)}
      {lead.is_overdue && <Badge bg="#FEE2E2" color="#B91C1C">Overdue</Badge>}
      {!lead.is_overdue && lead.is_due_today && <Badge bg="#FEF3C7" color="#B45309">Today</Badge>}
    </span>
  );
}

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
