// src/pages/AppHome.tsx
import { useNavigate } from "react-router-dom";

export default function AppHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("pmhub_token");
    } catch (err) {
      // Safari private mode or blocked storage — safe to ignore in prod, log in dev
      if (import.meta.env.DEV) {
        
        console.debug("localStorage.removeItem failed:", err);
      }
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div>Your private app/dashboard goes here.</div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg px-3 py-1.5 bg-[color:var(--accent-on-dark,#0EA5E9)] text-white hover:brightness-95"
      >
        Logout
      </button>
    </div>
  );
}
