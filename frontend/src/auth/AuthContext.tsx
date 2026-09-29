import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../api/auth";
import { tokens } from "../lib/tokens";
import type { User } from "../lib/types";

type Status = "loading" | "authed" | "anon";

interface AuthState {
  user: User | null;
  status: Status;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // On first load, resolve the session from a stored access token.
  useEffect(() => {
    if (!tokens.access) {
      setStatus("anon");
      return;
    }
    authApi
      .me()
      .then((u) => {
        setUser(u);
        setStatus("authed");
      })
      .catch(() => {
        tokens.clear();
        setStatus("anon");
      });
  }, []);

  async function login(username: string, password: string) {
    const { access, refresh } = await authApi.login({ username, password });
    tokens.set(access, refresh);
    const u = await authApi.me();
    setUser(u);
    setStatus("authed");
  }

  async function register(username: string, email: string, password: string) {
    await authApi.register({ username, email, password });
    await login(username, password);
  }

  function logout() {
    tokens.clear();
    setUser(null);
    setStatus("anon");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
