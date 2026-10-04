import { http } from "./http";
import type { ApiResponse, User } from "../types";

export async function login(email: string, password: string) {
  const response = await http.post<ApiResponse<{ token: string; user: User }>>(
    "/auth/login",
    {
      email,
      password,
    },
  );
  return response.data.data;
}

export async function getMe() {
  const response = await http.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}
