import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fmt2 = (n: number) => String(n).padStart(2, "0");
const isoDateOnly = (d: Date) => `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;

export default function MonthCalendar({
  month,          // prvi dan u mesecu (npr. 2025-11-01 00:00)
  selected,       // izabrani dan
  marks,          // Set<string> ISO YYYY-MM-DD dana koji imaju event
  onSelect,       // klik na dan
  onMonthChange,  // klik na strelice za promenu meseca
}: {
  month: Date;
  selected: Date;
  marks: Set<string>;
  onSelect: (d: Date) => void;
  onMonthChange: (m: Date) => void;
}) {
  // izgradi grid (počinje od ponedeljka)
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = first.getDay(); // 0=Sun
  const pad = (firstWeekday + 6) % 7; // Monday start

  const cells: (Date | null)[] = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  // popuni do pune 6x7 mreže
  while (cells.length % 7 !== 0) cells.push(null);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <button
          className="rounded p-1 hover:bg-zinc-100"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          className="rounded p-1 hover:bg-zinc-100"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-1">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) =>
          d ? (
            <button
              key={i}
              onClick={() => onSelect(d)}
              className={[
                "relative rounded-md py-2 text-sm hover:bg-zinc-100 transition",
                isSameDay(d, selected) ? "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300" : "",
              ].join(" ")}
            >
              {d.getDate()}
              {/* dot ako ima event tog dana */}
              {marks.has(isoDateOnly(d)) && (
                <span className="absolute inset-x-0 bottom-1 mx-auto h-1.5 w-1.5 rounded-full bg-cyan-500" />
              )}
            </button>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}
