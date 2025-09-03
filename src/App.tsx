import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import AppHome from "@/pages/AppHome";

import Navbar from "@/components/layout/Navbar";
import { ProtectedRoute } from "@/components/router/ProtectedRoute";
import { RedirectIfAuthed } from "@/components/router/RedirectIfAuthed";

/** Smart root: ako ima token → /dashboard, inače → /login */
function RootIndex() {
  const token =
    (typeof window !== "undefined" && localStorage.getItem("pmhub_token")) || null;
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function AppShell() {
  const { pathname } = useLocation();
  const hideNav = pathname === "/login" || pathname === "/register";

  const onLogout = () => {
    localStorage.removeItem("pmhub_token");
    window.location.href = "/login";
  };

  return (
    <>
      {!hideNav && <Navbar onLogout={onLogout} />}

      <Routes>
        <Route path="/" element={<RootIndex />} />
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppHome />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster position="top-right" theme="light" richColors visibleToasts={1}  duration={2500}/>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
