import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  registerUser,
  loginUser,
  getMe,
  type RegisterPayload,
  type UserDto,
} from "@/features/auth/api";
import { setAuthHeader } from "@/lib/http";

export function useAuthActions() {
  const { login: setSession } = useAuth();
  const [loading, setLoading] = useState<"login" | "register" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doLogin(email: string, password: string) {
    setLoading("login");
    setError(null);
    try {
      const { access_token } = await loginUser(email, password);

      // 1) zapamti token i podigni auth header
      localStorage.setItem("pmhub_token", access_token);
      setAuthHeader(access_token);

      // 2) povuci korisnika
      const me: UserDto = await getMe();

      // 3) u AuthContext upiši sesiju
      setSession(access_token, me);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e as Error).message ??
        "Login failed";
      setError(String(msg));
      throw e;
    } finally {
      setLoading(null);
    }
  }

  async function doRegister(payload: RegisterPayload): Promise<UserDto> {
    setLoading("register");
    setError(null);
    try {
      const user = await registerUser(payload);
      return user;
    } catch (e) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e as Error).message ??
        "Registration failed";
      setError(String(msg));
      throw e;
    } finally {
      setLoading(null);
    }
  }

  return { doRegister, doLogin, loading, error };
}
