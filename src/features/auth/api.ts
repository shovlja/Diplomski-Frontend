// src/features/auth/api.ts
import { api } from "@/lib/http";
// Ako već imaš svoje user tipove, zadrži ih – ovde izvozimo UserDto za useAuthActions.ts

const AUTH_PREFIX = "/api/v1/auth";

export type RegisterPayload = {
  display_name: string;
  email: string;
  password: string;
};

export type UserDto = {
  id: string;                     // UUID
  email: string;
  display_name: string;
  avatar_url?: string | null;
  system_role: "ADMIN" | "USER";
  is_active: boolean;
  created_at: string;             // ISO
};

export async function registerUser(data: RegisterPayload): Promise<UserDto> {
  const { data: user } = await api.post<UserDto>(`${AUTH_PREFIX}/register`, data);
  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const { data } = await api.post<{ access_token: string; token_type: string }>(
    `${AUTH_PREFIX}/login`,
    form,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
}

export async function getMe(): Promise<UserDto> {
  const { data } = await api.get<UserDto>(`${AUTH_PREFIX}/me`);
  return data;
}

export async function logout(): Promise<void> {
  await api.post(`${AUTH_PREFIX}/logout`, {});
}
