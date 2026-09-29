import { type FormEvent, useState } from "react";

import { authApi } from "../../api/auth";
import { apiError } from "../../lib/errors";
import { Icon } from "../Icon";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    setDone(false);
    if (next !== confirm) {
      setErrors({ new_password: ["Passwords do not match."] });
      return;
    }
    setBusy(true);
    try {
      await authApi.changePassword({ current_password: current, new_password: next });
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const parsed = apiError(err);
      setErrors(parsed.details);
      if (Object.keys(parsed.details).length === 0) setTopError(parsed.message);
    } finally {
      setBusy(false);
    }
  }

  const err = (f: string) => errors[f]?.[0];

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      {topError && (
        <div className="mb-4 rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
          {topError}
        </div>
      )}
      <Field label="Current password" error={err("current_password")}>
        <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </Field>
      <Field label="New password" error={err("new_password")}>
        <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Field label="Confirm new password">
        <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </button>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#15803D]">
            <Icon name="check" size={14} stroke="#15803D" />
            Password changed
          </span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="field-label">{label}</label>
      {children}
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#DC2626]">
          <Icon name="alert" size={13} />
          {error}
        </div>
      )}
    </div>
  );
}
