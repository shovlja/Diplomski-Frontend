// src/components/router/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function ProtectedRoute({ children }: Props) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pmhub_token") : null;

  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
