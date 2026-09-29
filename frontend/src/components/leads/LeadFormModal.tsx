import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { LeadWrite } from "../../api/leads";
import { leadsApi } from "../../api/leads";
import { useDebounce } from "../../hooks/useDebounce";
import { apiError } from "../../lib/errors";
import { SOURCE_META, SOURCE_ORDER } from "../../lib/leadMeta";
import { toDatetimeLocal } from "../../lib/format";
import type { Lead, LeadSource } from "../../lib/types";
import { Icon } from "../Icon";
import { Modal } from "../Modal";
import { Popover } from "../Popover";

interface Props {
  lead?: Lead; // present => edit mode
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}

export function LeadFormModal({ lead, onClose, onSaved }: Props) {
  const editing = Boolean(lead);
  const queryClient = useQueryClient();

  const [name, setName] = useState(lead?.name ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [source, setSource] = useState<LeadSource>(lead?.source ?? "other");
  const [followUp, setFollowUp] = useState(toDatetimeLocal(lead?.next_follow_up_at ?? null));
  const [note, setNote] = useState(lead?.note ?? "");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);

  // Live duplicate check (debounced) on email/phone.
  const [dup, setDup] = useState<{ id: number; name: string; field: string } | null>(null);
  const debounced = useDebounce({ email, phone }, 400);
  useEffect(() => {
    const { email: e, phone: p } = debounced;
    if (!e && !p) {
      setDup(null);
      return;
    }
    leadsApi
      .checkDuplicate(e, p)
      .then((res) => {
        if (res.duplicate && res.duplicate.id !== lead?.id) {
          setDup({ id: res.duplicate.id, name: res.duplicate.name, field: res.duplicate.matched_on });
        } else {
          setDup(null);
        }
      })
      .catch(() => setDup(null));
  }, [debounced, lead?.id]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: LeadWrite = {
        name,
        email,
        phone,
        source,
        note,
        next_follow_up_at: followUp ? new Date(followUp).toISOString() : null,
      };
      return editing ? leadsApi.update(lead!.id, payload) : leadsApi.create(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["lead", saved.id] });
      onSaved(saved);
    },
    onError: (err) => {
      const parsed = apiError(err);
      if (parsed.code === "duplicate_lead") {
        const field = parsed.details.field?.[0] ?? "phone";
        setErrors({ [field]: [parsed.message] });
      } else {
        setErrors(parsed.details);
        if (Object.keys(parsed.details).length === 0) setTopError(parsed.message);
      }
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    mutation.mutate();
  }

  const err = (f: string) => errors[f]?.[0];

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="text-base font-semibold text-ink">
            {editing ? "Edit lead" : "New lead"}
          </span>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-ink">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex max-h-[62vh] flex-col gap-4 overflow-auto p-5">
          {topError && (
            <div className="rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
              {topError}
            </div>
          )}

          <Field label="Name" required error={err("name")}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Email" error={err("email")}>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Phone" error={err("phone")} warn={dup?.field === "phone"}>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>

          {dup && (
            <div className="-mt-1 flex items-start gap-1.5 text-xs text-[#B45309]">
              <Icon name="alert" size={13} />
              <span>
                A lead with this {dup.field} already exists:{" "}
                <Link to={`/leads/${dup.id}`} onClick={onClose} className="font-semibold underline">
                  {dup.name} →
                </Link>
              </span>
            </div>
          )}
          <div className="-mt-1 text-xs text-gray-400">Email or phone is required.</div>

          <Field label="Source">
            <SourceSelect value={source} onChange={setSource} />
          </Field>

          <Field label="Next follow-up" error={err("next_follow_up_at")}>
            <input
              type="datetime-local"
              className="input"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </Field>

          <Field label="Note">
            <textarea
              rows={3}
              className="input resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-line bg-[#FAFAFA] px-5 py-3.5">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  error,
  warn,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  const ring = error
    ? "[&_input]:border-[#EF4444] [&_input]:ring-2 [&_input]:ring-[#EF4444]/12"
    : warn
      ? "[&_input]:border-[#F59E0B] [&_input]:ring-2 [&_input]:ring-[#F59E0B]/15"
      : "";
  return (
    <div>
      <label className="field-label">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>
      <div className={ring}>{children}</div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#DC2626]">
          <Icon name="alert" size={13} />
          {error}
        </div>
      )}
    </div>
  );
}

function SourceSelect({
  value,
  onChange,
}: {
  value: LeadSource;
  onChange: (v: LeadSource) => void;
}) {
  const meta = SOURCE_META[value];
  return (
    <Popover
      width={200}
      trigger={() => (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border border-[#D9D9DF] bg-white px-3 py-2 text-sm text-ink hover:border-[#B9B9C2]"
        >
          <span className="inline-flex items-center gap-2">
            <Icon name={meta.icon} size={15} stroke="#6B7280" />
            {meta.label}
          </span>
          <Icon name="chevdown" size={15} stroke="#9CA3AF" />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          {SOURCE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                close();
              }}
              className="flex items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name={SOURCE_META[s].icon} size={14} stroke="#6B7280" />
                {SOURCE_META[s].label}
              </span>
              {s === value && <Icon name="check" size={14} stroke="#4F46E5" strokeWidth={2.4} />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
