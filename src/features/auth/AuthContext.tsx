import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getMe } from "./api";

type User = { id: number; email: string; display_name: string; is_active?: boolean } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [user, setUser] = useState<User>(null);

  const restore = async () => {
    const t = localStorage.getItem("access_token");
    if (!t) return;
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => { restore(); }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    await restore();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, restore }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
