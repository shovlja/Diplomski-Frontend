import * as React from "react";
import { getUpcomingEvents } from "@/features/events/api";
import type { EventItem } from "@/features/events/types";

/* ---------- helpers ---------- */
const pad2 = (n: number) => String(n).padStart(2, "0");
const timeHHMM = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

function mondayOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun ... 6 Sat
  const diff = (day + 6) % 7; // Mon=0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - diff);
  return x;
}
function sundayOfWeek(d: Date) {
  const mon = mondayOfWeek(d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return sun;
}

function formatUpcoming(iso: string) {
  const now = new Date();
  const d = new Date(iso);

  // normalize to date-only for comparisons
  const nOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const msDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((dOnly.getTime() - nOnly.getTime()) / msDay);

  if (diffDays === 1) {
    return `Tomorrow, ${timeHHMM(d)}`;
  }

  // u istoj nedelji (pon–ned), u budućnosti
  const mon = mondayOfWeek(now);
  const sun = sundayOfWeek(now);
  if (dOnly >= mon && dOnly <= sun && d > now) {
    const wd = d.toLocaleDateString(undefined, { weekday: "short" });
    return `${wd}, ${timeHHMM(d)}`;
  }

  // fallback — pun datum
  const date = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${date}, ${timeHHMM(d)}`;
}

/* ---------- component ---------- */
export default function UpcomingCard() {
  const [items, setItems] = React.useState<EventItem[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getUpcomingEvents(5);
        if (alive) setItems(data);
      } catch (e) {
        console.error(e);
        if (alive) setErr("Failed to load upcoming events.");
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="h-[460px] rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">Upcoming</div>
          <div className="text-xs text-zinc-500">Next 7 days</div>
        </div>
        <a href="/?v=events" className="text-xs text-cyan-600 hover:underline">Open planning</a>
      </div>

      <div className="-mx-4 mb-0 h-px bg-zinc-200" />

      {/* Loading / error / empty */}
      {items === null ? (
        <div className="flex h-[356px] items-center justify-center text-sm text-zinc-500">Loading…</div>
      ) : err ? (
        <div className="flex h-[356px] items-center justify-center text-sm text-red-500">{err}</div>
      ) : items.length === 0 ? (
        <div className="flex h-[356px] items-center justify-center text-center text-sm text-zinc-500">
          No upcoming events.
        </div>
      ) : (
        <div className="mt-0 h-[356px] overflow-y-auto overflow-x-hidden">
          <ul className="divide-y divide-zinc-200">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-zinc-900">{it.title}</div>
                  <div className="text-xs text-zinc-500">Events</div>
                </div>
                <div className="ml-4 shrink-0 text-sm text-zinc-600">
                  {formatUpcoming(it.starts_at)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
