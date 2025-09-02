import { http } from "@/lib/http";

// payloadi
export type RegisterPayload = {
  display_name: string;
  email: string;
  password: string;
};

export type UserDto = {
  id: string;
  display_name: string;
  email: string;
  system_role?: "USER" | "ADMIN";
  is_active?: boolean;
  avatar_url?: string | null;
  created_at?: string;
};

// register → vraća UserOut sa backa
export async function registerUser(data: RegisterPayload): Promise<UserDto> {
  const { data: user } = await http.post<UserDto>("/auth/register", data);
  return user;
}

// login → vraća token
export async function loginUser(email: string, password: string): Promise<{
  access_token: string;
  token_type: string;
}> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const { data } = await http.post<{ access_token: string; token_type: string }>(
    "/auth/login",
    form,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return data;
}

// me → vraća UserOut
export async function getMe(): Promise<UserDto> {
  const { data } = await http.get<UserDto>("/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  await http.post("/auth/logout", {});
}
