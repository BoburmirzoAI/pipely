import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { permissionsApi, rolesApi } from "../../api/users";
import { apiError } from "../../lib/errors";
import type { Role } from "../../lib/types";
import { Icon } from "../Icon";

export function RolesMatrix() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: rolesApi.list });
  const permsQuery = useQuery({ queryKey: ["permissions"], queryFn: permissionsApi.list });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["roles"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, codes }: { id: number; codes: string[] }) =>
      rolesApi.update(id, { permission_codes: codes }),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (err) => setError(apiError(err).message),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => rolesApi.create({ name, permission_codes: [] }),
    onSuccess: () => {
      setError(null);
      setNewName("");
      invalidate();
    },
    onError: (err) => setError(apiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (err) => setError(apiError(err).message),
  });

  const roles = rolesQuery.data ?? [];
  const perms = permsQuery.data ?? [];

  function toggle(role: Role, code: string) {
    const codes = role.permissions.includes(code)
      ? role.permissions.filter((c) => c !== code)
      : [...role.permissions, code];
    updateMutation.mutate({ id: role.id, codes });
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New role name"
          className="input sm:w-56"
        />
        <button
          className="btn-primary"
          disabled={!newName.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate(newName.trim())}
        >
          <Icon name="plus" size={15} strokeWidth={2.2} />
          Create role
        </button>
      </div>

      <div className="overflow-auto rounded-xl border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-[#FAFAFA]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="px-3 py-2.5 text-center text-xs font-semibold text-ink">
                  <div className="flex items-center justify-center gap-1.5">
                    {role.name}
                    {role.is_system ? (
                      <span title="System role" className="text-gray-400">
                        <Icon name="check" size={11} />
                      </span>
                    ) : (
                      <button
                        title="Delete role"
                        onClick={() => deleteMutation.mutate(role.id)}
                        className="text-gray-400 hover:text-[#DC2626]"
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((perm) => (
              <tr key={perm.id} className="border-b border-[#F1F1F3] last:border-0">
                <td className="px-4 py-2 text-[13px]">
                  <div className="font-medium text-ink">{perm.code}</div>
                  <div className="text-xs text-gray-400">{perm.description}</div>
                </td>
                {roles.map((role) => {
                  const checked = role.permissions.includes(perm.code);
                  const locked = role.name === "Admin"; // Admin permissions are locked
                  return (
                    <td key={role.id} className="px-3 py-2 text-center">
                      <button
                        disabled={locked}
                        onClick={() => toggle(role, perm.code)}
                        className="inline-flex h-4 w-4 items-center justify-center rounded border disabled:opacity-50"
                        style={
                          checked
                            ? { background: "#4F46E5", borderColor: "#4F46E5" }
                            : { borderColor: "#D1D5DB" }
                        }
                      >
                        {checked && <Icon name="check" size={11} stroke="#fff" strokeWidth={3} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
