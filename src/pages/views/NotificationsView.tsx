import * as React from "react";
import { listNotifications, acceptInvite, declineInvite } from "@/features/notifications/api";
import type { Notification } from "@/features/notifications/types";
import NotificationItem from "@/components/ui/notifications/NotificationItem";
import { toast } from "sonner";

/** Lokalno proširenje – marker da je pozivnica prihvaćena bez reloada */
export type LocalNotification = Notification & { __accepted?: boolean };

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
  const [items, setItems] = React.useState<LocalNotification[] | null>(null);
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
        if (!dead) setItems(data as LocalNotification[]);
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
    if (filter === "actionable") {
      // actionable = pozivnice koje nisu prihvaćene/odbijene
      return arr.filter((n) => n.kind === "team_invite" && !n.__accepted);
    }
    return arr;
  }, [items, filter]);

  // helpers to find notification by id
  const findById = React.useCallback(
    (id: number) => (items ?? []).find((x) => x.id === id),
    [items]
  );

  // actions
  async function handleAccept(n: LocalNotification) {
    // 1) optimistic transform
    setItems((prev) =>
      prev
        ? prev.map((x) =>
            x.id === n.id ? { ...x, __accepted: true, is_read: true } : x
          )
        : prev
    );

    const team = (n as Notification).payload?.team_name ?? "team";

    // 2) server + toast
    try {
      await toast.promise(acceptInvite(n.id), {
        loading: "Accepting invite…",
        success: `You have joined the team ${team}.`,
        error: "Failed to accept invite. Please try again.",
      });
    } catch {
      // rollback
      setItems((prev) =>
        prev
          ? prev.map((x) =>
              x.id === n.id
                ? { ...x, __accepted: false, is_read: n.is_read }
                : x
            )
          : prev
      );
    }
  }

  async function handleDecline(n: LocalNotification) {
    // optimistic remove
    setItems((prev) => (prev ? prev.filter((x) => x.id !== n.id) : prev));

    try {
      await toast.promise(declineInvite(n.id), {
        loading: "Declining…",
        success: "Invite declined.",
        error: "Failed to decline invite. Please try again.",
      });
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

  // wrappers za NotificationItem (ono šalje samo id)
  const onAcceptById = (id: number) => {
    const n = findById(id);
    if (n) void handleAccept(n);
  };
  const onDeclineById = (id: number) => {
    const n = findById(id);
    if (n) void handleDecline(n);
  };

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
            <NotificationItem
              key={n.id}
              data={n}
              onAccept={onAcceptById}
              onDecline={onDeclineById}
            />
          ))}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
