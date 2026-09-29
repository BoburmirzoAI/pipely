import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { tokens } from "../lib/tokens";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8002";

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  // Serialize arrays as repeated params (?status=new&status=contacted),
  // which is what DRF expects — not the bracketed default.
  paramsSerializer: { indexes: null },
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const access = tokens.access;
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Refresh the access token once on a 401, then retry the original request.
// A single shared promise avoids a stampede when several requests 401 at once.
let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokens.refresh;
  if (!refresh) return null;
  try {
    const resp = await axios.post(`${BASE}/api/v1/auth/refresh/`, { refresh });
    const access = resp.data.access as string;
    tokens.set(access);
    return access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthCall = original?.url?.includes("/auth/");
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthCall &&
      tokens.refresh
    ) {
      original._retry = true;
      refreshing = refreshing ?? refreshAccess();
      const access = await refreshing;
      refreshing = null;

      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      }
      // Refresh failed -> hard logout.
      tokens.clear();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
