import type {
  AdminUser,
  AppPermission,
  Paginated,
  Role,
} from "../lib/types";
import { api } from "./client";

export const usersApi = {
  list(params: { search?: string; page?: number; page_size?: number } = {}) {
    return api
      .get<Paginated<AdminUser>>("/users/", { params })
      .then((r) => r.data);
  },
  update(id: number, data: { role_ids?: number[]; is_active?: boolean }) {
    return api.patch<AdminUser>(`/users/${id}/`, data).then((r) => r.data);
  },
};

export const rolesApi = {
  list() {
    return api.get<Role[]>("/roles/").then((r) => r.data);
  },
  create(data: { name: string; description?: string; permission_codes: string[] }) {
    return api.post<Role>("/roles/", data).then((r) => r.data);
  },
  update(
    id: number,
    data: { name?: string; description?: string; permission_codes?: string[] },
  ) {
    return api.patch<Role>(`/roles/${id}/`, data).then((r) => r.data);
  },
  remove(id: number) {
    return api.delete(`/roles/${id}/`).then(() => undefined);
  },
};

export const permissionsApi = {
  list() {
    return api.get<AppPermission[]>("/permissions/").then((r) => r.data);
  },
};
