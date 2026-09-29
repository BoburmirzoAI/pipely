import type { User } from "../lib/types";
import { api } from "./client";

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  register(data: { username: string; email: string; password: string }) {
    return api.post<User>("/auth/register/", data).then((r) => r.data);
  },
  login(data: { username: string; password: string }) {
    return api.post<LoginResponse>("/auth/login/", data).then((r) => r.data);
  },
  me() {
    return api.get<User>("/auth/me/").then((r) => r.data);
  },
  updateProfile(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }) {
    return api.patch<User>("/auth/me/", data).then((r) => r.data);
  },
  changePassword(data: { current_password: string; new_password: string }) {
    return api
      .post<{ detail: string }>("/auth/change-password/", data)
      .then((r) => r.data);
  },
};
