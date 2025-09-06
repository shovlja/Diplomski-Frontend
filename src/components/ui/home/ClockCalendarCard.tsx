// src/components/ui/home/ClockCalendarCard.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";

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
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function ClockCalendarCard({ time, heightClass }: { time: string; heightClass?: string }) {
  const today = React.useMemo(() => new Date(), []);
  const [view, setView] = React.useState(() => new Date());

  const first = startOfMonth(view);
  const total = daysInMonth(view);
  const startDay = (first.getDay() + 6) % 7; // Mon=0

  // 6 redova * 7 kolona = 42 ćelije (stabilni key-evi)
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
    <div
      className="
        rounded-xl border border-zinc-200 bg-white
        shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]
        p-4 pb-5 overflow-hidden
        h-[460px]
      "
    >
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
              <div key={`wd-${d}`} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const isToday = c.date && isSameDay(c.date, today);

              const base =
                "h-9 rounded-md border text-sm leading-9 transition text-center";
              const valid = "border-zinc-200 bg-white hover:bg-zinc-50";
              const pad = "border-transparent bg-transparent pointer-events-none";

              // SAMO današnji dan naglašen: drugačiji bg + podebljan tekst
              const todayCls = "bg-cyan-50 font-semibold";

              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!c.date}
                  onClick={() => {
                    // ovde i dalje možeš da reaguješ na klik (planiranje itd.)
                    // npr. open modal / setSelectedDate(c.date)
                  }}
                  className={[base, c.day ? valid : pad, isToday ? todayCls : ""].join(" ")}
                >
                  {c.day ?? ""}
                </button>
              );
            })}
          </div>
        </div>

        
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
