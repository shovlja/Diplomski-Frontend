// src/components/router/RedirectIfAuthed.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export function RedirectIfAuthed({ children }: Props) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pmhub_token") : null;

  if (token) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
