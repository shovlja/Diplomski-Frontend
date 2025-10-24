// src/pages/views/NotificationsView.tsx
import * as React from "react";
import { listNotifications, acceptInvite, declineInvite } from "@/features/notifications/api";
import type { Notification } from "@/features/notifications/types";
import NotificationCard from "@/components/ui/notifications/NotificationCard";

/* --------------------- Segmented (All / Unread / Actionable) -------------------- */
type FilterKey = "all" | "unread" | "actionable";

function SegmentedFilters({
  value,
  onChange,
}: {
  value: FilterKey;
  onChange: (v: FilterKey) => void;
}) {
  const items: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "actionable", label: "Actionable" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={[
              "cursor-pointer rounded-full px-4 py-2 text-sm transition",
              active
                ? "bg-white text-zinc-900 ring-2 ring-cyan-200 shadow-[0_0_0_3px_rgba(34,211,238,.20)]"
                : "text-zinc-600 hover:text-zinc-800",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------- View ------------------------------------- */
export default function NotificationsView() {
  const [items, setItems] = React.useState<Notification[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<FilterKey>("all");

  // load
  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setLoading(true);
        const data = await listNotifications();
        if (!dead) setItems(data);
      } catch (e) {
        if (!dead) setError((e as Error).message);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  // filter
  const visible = React.useMemo(() => {
    const arr = items ?? [];
    if (filter === "unread") return arr.filter((n) => !n.is_read);
    if (filter === "actionable") return arr; // svi su actionable (za sada)
    return arr;
  }, [items, filter]);

  // actions
  async function handleAccept(n: Notification) {
    // optimistic remove
    setItems((prev) => (prev ? prev.filter((x) => x.id !== n.id) : prev));
    try {
      await acceptInvite(n.id);
    } catch {
      // rollback
      setItems((prev) =>
        prev
          ? [...prev, n].sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
            )
          : prev
      );
    }
  }

  async function handleDecline(n: Notification) {
    setItems((prev) => (prev ? prev.filter((x) => x.id !== n.id) : prev));
    try {
      await declineInvite(n.id);
    } catch {
      setItems((prev) =>
        prev
          ? [...prev, n].sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
            )
          : prev
      );
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pt-2 pb-4">
        <h1 className="text-xl font-semibold text-zinc-900">Notifications</h1>
        <SegmentedFilters value={filter} onChange={setFilter} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100" />
                <div className="h-4 w-1/2 rounded bg-zinc-100" />
              </div>
              <div className="mt-3 h-9 w-40 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          Failed to load notifications. {error}
        </div>
      ) : (visible?.length ?? 0) === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-14 text-sm text-zinc-600">
          No notifications.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
