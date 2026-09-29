import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { rolesApi, usersApi } from "../../api/users";
import { useDebounce } from "../../hooks/useDebounce";
import { usePermissions } from "../../hooks/usePermissions";
import { apiError } from "../../lib/errors";
import type { AdminUser } from "../../lib/types";
import { Icon } from "../Icon";
import { Popover } from "../Popover";

export function UsersTable() {
  const { has } = usePermissions();
  const canManage = has("rbac.manage");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(search, 300);

  const usersQuery = useQuery({
    queryKey: ["admin-users", debounced],
    queryFn: () => usersApi.list({ search: debounced, page_size: 100 }),
  });
  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: rolesApi.list });

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { role_ids?: number[]; is_active?: boolean } }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => setError(apiError(err).message),
  });

  const roles = rolesQuery.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 sm:w-64">
        <Icon name="search" size={15} stroke="#9CA3AF" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-gray-400"
        />
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-[#FAFAFA] text-left text-xs font-semibold text-gray-500">
              <th className="px-4 py-2.5">Username</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Roles</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data?.data ?? []).map((u) => (
              <tr key={u.id} className="border-b border-[#F1F1F3] last:border-0">
                <td className="px-4 py-2.5 text-[13px] font-medium text-ink">{u.username}</td>
                <td className="px-4 py-2.5 text-[13px] text-gray-600">{u.email}</td>
                <td className="px-4 py-2.5">
                  {canManage ? (
                    <RolesEditor
                      user={u}
                      allRoles={roles}
                      onChange={(roleIds) =>
                        mutation.mutate({ id: u.id, data: { role_ids: roleIds } })
                      }
                    />
                  ) : (
                    <RoleBadges names={u.roles} />
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {canManage ? (
                    <button
                      onClick={() =>
                        mutation.mutate({ id: u.id, data: { is_active: !u.is_active } })
                      }
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active
                          ? "bg-[#ECFDF3] text-[#15803D]"
                          : "bg-[#F3F4F6] text-gray-500"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  ) : (
                    <span className="text-[13px] text-gray-600">
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadges({ names }: { names: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((n) => (
        <span key={n} className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand">
          {n}
        </span>
      ))}
    </div>
  );
}

function RolesEditor({
  user,
  allRoles,
  onChange,
}: {
  user: AdminUser;
  allRoles: { id: number; name: string }[];
  onChange: (roleIds: number[]) => void;
}) {
  const currentIds = allRoles.filter((r) => user.roles.includes(r.name)).map((r) => r.id);

  function toggle(id: number) {
    const next = currentIds.includes(id)
      ? currentIds.filter((x) => x !== id)
      : [...currentIds, id];
    onChange(next);
  }

  return (
    <Popover
      width={180}
      trigger={() => (
        <button className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[13px] hover:bg-[#FAFAFB]">
          <RoleBadges names={user.roles} />
          <Icon name="chevdown" size={12} stroke="#9CA3AF" />
        </button>
      )}
    >
      {() => (
        <div className="flex flex-col">
          {allRoles.map((r) => {
            const checked = currentIds.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
              >
                <span
                  className="flex h-4 w-4 flex-none items-center justify-center rounded border"
                  style={checked ? { background: "#4F46E5", borderColor: "#4F46E5" } : { borderColor: "#D1D5DB" }}
                >
                  {checked && <Icon name="check" size={11} stroke="#fff" strokeWidth={3} />}
                </span>
                {r.name}
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}
