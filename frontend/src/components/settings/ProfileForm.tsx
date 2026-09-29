import { type FormEvent, useState } from "react";

import { authApi } from "../../api/auth";
import { useAuth } from "../../auth/AuthContext";
import { apiError } from "../../lib/errors";
import { Icon } from "../Icon";

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaved(false);
    setBusy(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setErrors(apiError(err).details);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">First name</label>
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Last name</label>
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <label className="field-label">Username</label>
        <input className="input bg-gray-50 text-gray-500" value={user?.username ?? ""} readOnly />
      </div>
      <div className="mt-4">
        <label className="field-label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#DC2626]">
            <Icon name="alert" size={13} />
            {errors.email[0]}
          </div>
        )}
      </div>
      <div className="mt-4">
        <label className="field-label">Roles</label>
        <div className="flex flex-wrap gap-1.5">
          {(user?.roles ?? []).map((r) => (
            <span key={r} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">
              {r}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-[#15803D]">
            <Icon name="check" size={14} stroke="#15803D" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
