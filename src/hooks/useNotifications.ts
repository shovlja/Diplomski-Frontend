import * as React from "react";
import type { Notification } from "@/features/notifications/types";
import { listNotifications, acceptInvite, declineInvite } from "@/features/notifications/api";

const LS_KEY = "notif.local.v1";

function readLocal(): Notification[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Notification[]) : [];
  } catch {
    // no-op (localStorage unavailable or invalid JSON)
    return [];
  }
}
function writeLocal(items: Notification[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // no-op
  }
}

export type NotificationsFilter = "all" | "unread" | "actionable";

function getHttpStatus(err: unknown): number {
  const maybe = err as { response?: { status?: unknown } } | null | undefined;
  const s = maybe?.response?.status;
  return typeof s === "number" ? s : 0;
}

export function useNotifications() {
  const [items, setItems] = React.useState<Notification[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [fallback, setFallback] = React.useState(false); // localStorage mod kada BE ne postoji

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setFallback(false);
    try {
      const data = await listNotifications();
      setItems(data);
    } catch (e: unknown) {
      const status = getHttpStatus(e);
      // 404 ili network (status 0) => tretiramo kao “nema endpointa” i radimo lokalno
      if (status === 404 || status === 0) {
        const local = readLocal();
        setItems(local);
        setFallback(true);
        setError(null);
      } else {
        setError((e as Error)?.message ?? "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function onAccept(id: number) {
    setItems((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
    if (fallback) {
      writeLocal((items ?? []).filter((n) => n.id !== id));
      return;
    }
    try {
      await acceptInvite(id);
    } catch {
      void fetchAll();
    }
  }

  async function onDecline(id: number) {
    setItems((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
    if (fallback) {
      writeLocal((items ?? []).filter((n) => n.id !== id));
      return;
    }
    try {
      await declineInvite(id);
    } catch {
      void fetchAll();
    }
  }

  function seedLocalDemo(data: Notification[]) {
    writeLocal(data);
    setItems(data);
    setFallback(true);
  }

  return {
    items,
    loading,
    error,
    refetch: fetchAll,
    onAccept,
    onDecline,
    setItems,
    fallback,
    seedLocalDemo,
  };
}
