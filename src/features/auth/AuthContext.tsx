/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { setAuthHeader } from "@/lib/http";
import type { AuthUser } from "@/features/auth/types";

type AuthCtxValue = {
  token: string | null;
  user: AuthUser | null;
  // login sada PRIMA token i user
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

const AuthContext = createContext<AuthCtxValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const bootToken =
    typeof window !== "undefined" ? localStorage.getItem("pmhub_token") : null;

  const [token, setToken] = useState<string | null>(bootToken);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Podigni auth header ako smo imali token iz localStorage-a
  if (bootToken) setAuthHeader(bootToken);

  const login = useCallback((newToken: string, me: AuthUser) => {
    setToken(newToken);
    setUser(me);
    try {
      localStorage.setItem("pmhub_token", newToken);
    } catch {
      // ignore storage errors (private mode / disabled storage)
    }
    setAuthHeader(newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("pmhub_token");
    } catch {
      // ignore storage errors
    }
    setAuthHeader(null);
  }, []);

  const value = useMemo<AuthCtxValue>(
    () => ({ token, user, login, logout, setUser }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtxValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
