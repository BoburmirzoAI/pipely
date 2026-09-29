import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../auth/AuthContext";
import { apiError } from "../lib/errors";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      navigate("/leads", { replace: true });
    } catch (err) {
      const { code, message } = apiError(err);
      setError(
        code === "not_authenticated" || code === "authentication_failed"
          ? "Incorrect username or password."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workspace"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-brand">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}
        <div>
          <label className="field-label">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary mt-0.5 w-full justify-center py-2.5" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
