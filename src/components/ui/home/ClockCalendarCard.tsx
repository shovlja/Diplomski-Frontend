// src/components/ui/home/ClockCalendarCard.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button"; // ili { Button } ako je tvoj export named

type Props = { time: string };

// helpers
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function addMonths(d: Date, delta: number) {
  const n = new Date(d);
  n.setMonth(n.getMonth() + delta);
  return n;
}
function fmtMonthYear(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}
const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function ClockCalendarCard({ time }: Props) {
  const today = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState(() => new Date());
  // selektovan je današnji dan po defaultu
  const [selected, setSelected] = React.useState<Date | null>(() => new Date());

  const first = startOfMonth(view);
  const total = daysInMonth(view);
  const startDay = (first.getDay() + 6) % 7; // Mon=0

  // stabilni key-evi (6x7=42 ćelije)
  const cells: Array<{ key: string; day: number | null; date?: Date }> = [];
  let cur = 1 - startDay;
  for (let i = 0; i < 42; i++, cur++) {
    if (cur < 1 || cur > total) {
      cells.push({ key: `pad-${i}`, day: null });
    } else {
      const date = new Date(view.getFullYear(), view.getMonth(), cur);
      cells.push({ key: `d-${date.toISOString().slice(0, 10)}`, day: cur, date });
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)] p-4 pb-5 h-[460px]">
      <div className="grid h-full grid-rows-[auto,1fr,auto] gap-4">
        {/* Header */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">Local time</div>
          <div className="mt-1 text-2xl font-semibold text-zinc-900">{time}</div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              className="h-8 w-8 rounded-md border border-zinc-200 hover:bg-zinc-50"
              onClick={() => setView((v) => addMonths(v, -1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="text-sm font-medium text-zinc-900">{fmtMonthYear(view)}</div>
            <button
              type="button"
              className="h-8 w-8 rounded-md border border-zinc-200 hover:bg-zinc-50"
              onClick={() => setView((v) => addMonths(v, +1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="select-none">
          <div className="grid grid-cols-7 text-center text-xs text-zinc-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={`wd-${d}`} className="py-1">{d}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const isToday = c.date && isSameDay(c.date, today);
              const isSel = c.date && isSameDay(c.date, selected);

              const base = "h-9 rounded-md border text-sm leading-9 transition text-center";
              const valid = "border-zinc-200 bg-white hover:bg-zinc-50";
              const pad = "border-transparent bg-transparent pointer-events-none";

              const todayCls = "border-cyan-300 bg-cyan-50 text-cyan-700 font-medium";
              const selCls   = "bg-cyan-500 text-white border-transparent";

              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!c.date}
                  aria-selected={!!isSel}
                  onClick={() => c.date && setSelected(c.date)}
                  className={[
                    base,
                    c.day ? valid : pad,
                    isSel ? selCls : isToday ? todayCls : "",
                  ].join(" ")}
                >
                  {c.day ?? ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div>
          <Link to="/?v=events" className="block w-full">
            <Button variant="primary" rounded="full" fullWidth className="h-11">
              Add event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
