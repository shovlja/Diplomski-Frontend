import { http } from "@/lib/http";

/** Types */
export type RegisterPayload = {
  display_name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UserDto = {
  id: string;
  display_name: string;
  email: string;
  system_role: "USER" | "ADMIN";
  is_active: boolean;
  avatar_url?: string | null;
  created_at: string;
};


/** --- Endpoints (rute prilagodi po potrebi) --- */

// JSON body: { display_name, email, password }
export async function registerUser(data: RegisterPayload): Promise<UserDto> {
  const resp = await http.post<UserDto>("/auth/register", data);
  return resp.data;
}

// POST /auth/login (x-www-form-urlencoded: username + password)
export async function loginUser(email: string, password: string): Promise<{
  access_token: string;
  token_type: string;
}> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const resp = await http.post<{ access_token: string; token_type: string }>(
    "/auth/login", // <<< uskladi sa backendom
    form,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return resp.data;
}

// GET /auth/me (vrati pune podatke o useru)
export async function getMe(): Promise<UserDto> {
  const resp = await http.get<UserDto>("/auth/me");
  return resp.data;
}

// (opciono) POST /auth/logout ako postoji
export async function logout(): Promise<void> {
  await http.post("/auth/logout", {});
}

// aliasi po želji
export const apiRegister = registerUser;
export const apiLogin = loginUser;
export const apiMe = getMe;
export const apiLogout = logout;