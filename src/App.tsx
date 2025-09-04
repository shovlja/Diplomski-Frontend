import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import AppHome from "@/pages/AppHome";

import { ProtectedRoute } from "@/components/router/ProtectedRoute";
import { RedirectIfAuthed } from "@/components/router/RedirectIfAuthed";
import AppLayout from "@/components/layout/AppLayout";

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
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

        {/* Protected root "/" (Navbar + Sidebar u AppLayout) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* index = "/" → AppHome sam menja prikaz preko ?v=... */}
          <Route index element={<AppHome />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" theme="light" richColors visibleToasts={1} duration={2500} />
    </>
  );
}
