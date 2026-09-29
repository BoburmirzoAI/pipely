import type { AxiosError } from "axios";

import type { ApiError } from "./types";

export interface ParsedError {
  message: string;
  details: Record<string, string[]>;
  code?: string;
}

/** Normalize an axios error into our API's { message, details } shape. */
export function apiError(err: unknown): ParsedError {
  const e = err as AxiosError<ApiError>;
  const payload = e.response?.data;
  if (payload && payload.error) {
    const details: Record<string, string[]> = {};
    for (const [key, val] of Object.entries(payload.error.details ?? {})) {
      details[key] = Array.isArray(val) ? val.map(String) : [String(val)];
    }
    return { message: payload.error.message, details, code: payload.error.code };
  }
  if (e.message === "Network Error") {
    return { message: "Cannot reach the server. Is the backend running?", details: {} };
  }
  return { message: "Something went wrong. Please try again.", details: {} };
}
