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
};
