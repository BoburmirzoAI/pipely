import { useAuth } from "../auth/AuthContext";
import type { PermissionCode } from "../lib/types";

/**
 * Read the current user's permission codes (from /auth/me via AuthContext).
 * UX only — the backend always enforces permissions.
 */
export function usePermissions() {
  const { user } = useAuth();
  const codes = new Set(user?.permissions ?? []);
  return {
    has: (code: PermissionCode) => codes.has(code),
    hasAny: (...cs: PermissionCode[]) => cs.some((c) => codes.has(c)),
  };
}
