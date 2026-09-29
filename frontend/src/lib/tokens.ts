// JWT tokens are kept in localStorage for simplicity.
// Tradeoff (documented in ARCHITECTURE.md): readable by JS, so vulnerable to
// XSS, but avoids CSRF and keeps the SPA stateless. Wrapped in try/catch so a
// private window with blocked storage never crashes the app.

const ACCESS_KEY = "pipely_access";
const REFRESH_KEY = "pipely_refresh";

export const tokens = {
  get access(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
  get refresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  set(access: string, refresh?: string) {
    try {
      localStorage.setItem(ACCESS_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch {
      /* ignore */
    }
  },
};
