import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // nije ulogovan → login
  if (!user) return <Navigate to="/login" replace state={{ from: pathname }} />;

  // nema admin privilegije → nazad na home
  if (user.system_role !== "ADMIN") return <Navigate to="/" replace />;

  return <>{children}</>;
}
