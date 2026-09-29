import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthShell } from "../components/AuthShell";
import { Icon } from "../components/Icon";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../lib/errors";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    setBusy(true);
    try {
      await register(username, email, password);
      navigate("/leads", { replace: true });
    } catch (err) {
      const parsed = apiError(err);
      setErrors(parsed.details);
      if (Object.keys(parsed.details).length === 0) setTopError(parsed.message);
    } finally {
      setBusy(false);
    }
  }

  const fieldError = (name: string) => errors[name]?.[0];

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing your pipeline"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {topError && (
          <div className="rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
            {topError}
          </div>
        )}
        <Field label="Username" error={fieldError("username")}>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </Field>
        <Field label="Email" error={fieldError("email")}>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" error={fieldError("password")}>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <button type="submit" className="btn-primary mt-0.5 w-full justify-center py-2.5" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
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
    <div>
      <label className="field-label">{label}</label>
      <div className={error ? "[&_input]:border-[#EF4444] [&_input]:ring-2 [&_input]:ring-[#EF4444]/12" : ""}>
        {children}
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#DC2626]">
          <Icon name="alert" size={13} />
          {error}
        </div>
      )}
    </div>
  );
}
