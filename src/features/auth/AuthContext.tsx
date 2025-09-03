/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { setAuthHeader } from "@/lib/http";
import type { AuthUser } from "@/features/auth/types";
import { getMe } from "@/features/auth/api"; // ← prilagodi putanju ako je drugačija

const TOKEN_KEY = "pmhub_token";
const ME_KEY = "pmhub_me";

type AuthCtxValue = {
  token: string | null;
  user: AuthUser | null;
  initializing: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  restore: () => Promise<void>;
};

const AuthContext = createContext<AuthCtxValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const bootToken =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const [token, setToken] = useState<string | null>(bootToken);

  // Seed-uj user-a iz keša da ime postoji odmah posle reloada
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem(ME_KEY);
      return cached ? (JSON.parse(cached) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [initializing, setInitializing] = useState<boolean>(true);

  // Drži Authorization header u skladu sa tokenom
  useEffect(() => {
    setAuthHeader(token);
  }, [token]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ME_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
    setAuthHeader(null);
    // Hard redirect na login prekida sve pending pozive i sprečava "treperenje"
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, []);

  const login = useCallback((newToken: string, me: AuthUser) => {
    setToken(newToken);
    setUser(me);
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(ME_KEY, JSON.stringify(me));
    } catch {
      /* ignore storage errors */
    }
    setAuthHeader(newToken);
  }, []);

  const restore = useCallback(async () => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (!t) {
      setToken(null);
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      setAuthHeader(t);
      const me = await getMe(); // treba da vrati AuthUser ili baci 401
      setUser(me);
      setToken(t);
      try {
        localStorage.setItem(ME_KEY, JSON.stringify(me));
      } catch {
        /* ignore */
      }
    } catch (e) {
      // token nevažeći / istekao / 401 → tretiraj kao logout
      logout();
      return; // logout već radi redirect
    } finally {
      setInitializing(false);
    }
  }, [logout]);

  // Pozovi restore na mount
  useEffect(() => {
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthCtxValue>(
    () => ({ token, user, initializing, login, logout, setUser, restore }),
    [token, user, initializing, login, logout, restore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtxValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
