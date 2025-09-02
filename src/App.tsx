import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import AppHome from "@/pages/AppHome";

import { ProtectedRoute } from "@/components/router/ProtectedRoute";
import { RedirectIfAuthed } from "@/components/router/RedirectIfAuthed";

/** Smart root: ako ima token → /app, inače → /login */
function RootIndex() {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("pmhub_token")) || null;
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootIndex />} />

        {/* Public (sakrij kad je ulogovan) */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <RegisterPage />
            </RedirectIfAuthed>
          }
        />

        {/* Privatno */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppHome />
            </ProtectedRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        theme="light"
        richColors
        closeButton
        duration={3500}
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border border-white/30 bg-white/80 backdrop-blur-md shadow-lg text-slate-900",
            description: "text-slate-600",
            actionButton:
              "rounded-lg px-3 py-1 font-medium bg-[color:var(--accent-on-dark,#0EA5E9)] text-white hover:brightness-95",
            cancelButton:
              "rounded-lg px-3 py-1 font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          },
        }}
      />
    </BrowserRouter>
  );
}
