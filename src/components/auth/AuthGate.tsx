import * as React from "react";
import type { ReactNode } from "react";
import { useAuthActions } from "@/hooks/useAuthActions";

/**
 * Minimal AuthGate:
 * - Ako postoji token u storage-u, pokušava boot; ako hook nema fetchMe, samo nastavlja.
 * - Ne oslanja se na loading === "me", pa nema tip konflikata.
 */
type MaybeAuth = {
  fetchMe?: () => Promise<unknown>;
};

export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuthActions() as MaybeAuth;
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const hasToken =
      typeof window !== "undefined" && !!localStorage.getItem("pmhub_token");

    async function run() {
      if (!hasToken) {
        if (!cancelled) setBooting(false);
        return;
      }
      // Ako postoji fetchMe u hooku — odradi ga, u suprotnom samo nastavi
      try {
        if (typeof auth.fetchMe === "function") {
          await auth.fetchMe();
        }
      } catch {
        /* ignore boot errors; 401 će global interceptor obraditi */
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  if (booting) return null; // ili neki mali splash/spinner

  return <>{children}</>;
}
