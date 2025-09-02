import { useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { registerUser } from "../features/auth/api";

// Define the payload type locally to avoid runtime imports
type RegisterPayload = {
  email: string;
  password: string;
  display_name: string;
};

export function useAuthActions() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<"login" | "register" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doLogin(email: string, password: string) {
    setLoading("login");
    setError(null);
    try {
      const { access_token } = await loginUser(email, password);
      localStorage.setItem("pmhub_token", access_token);
    } catch (e: unknown) {
      const msg =
        (e as any)?.response?.data?.detail ||
        (e as Error)?.message ||
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
      return user; // ← VAŽNO
    } catch (e: unknown) {
      const msg =
        (e as any)?.response?.data?.detail ||
        (e as Error)?.message ||
        "Registration failed";
      setError(String(msg));
      throw e;
    } finally {
      setLoading(null);
    }
  }

  return { doRegister, doLogin, loading, error };
}
