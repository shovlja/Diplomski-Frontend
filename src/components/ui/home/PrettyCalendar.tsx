// src/components/ui/home/PrettyCalendar.tsx
import * as React from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Size = "sm" | "md";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function PrettyCalendar({
  value,
  onChange,
  size = "sm",
  weekStartsOn = 1,
  className,
}: {
  value?: Date;
  onChange?: (d: Date) => void;
  size?: Size;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const initial = value ?? new Date();
  const [month, setMonth] = React.useState<Date>(startOfMonth(initial));
  const [selected, setSelected] = React.useState<Date>(initial);

  React.useEffect(() => {
    if (value) {
      setSelected(value);
      setMonth(startOfMonth(value));
    }
  }, [value]);

  const firstGridDay = startOfWeek(startOfMonth(month), { weekStartsOn });
  const days: Date[] = React.useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(firstGridDay, i)),
    [firstGridDay]
  );

  const cell = size === "sm" ? "h-8 w-8 text-[13px]" : "h-9 w-9 text-sm";

  const weekdayRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "0.25rem",
    textAlign: "center",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "0.25rem",
    textAlign: "center",
  };

  const handleSelect = (d: Date) => {
    setSelected(d);
    onChange?.(d);
  };

  return (
    <div className={cx("select-none w-full min-w-[280px]", className)}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-sm font-medium text-zinc-900">
          {format(month, "MMMM yyyy")}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, -1))}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div style={weekdayRowStyle} className="text-[11px] uppercase tracking-wide text-zinc-500">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(firstGridDay, i);
          return (
            <div key={i} className="py-1">
              {format(d, "EEE").slice(0, 2)}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div style={gridStyle} className="mt-1">
        {days.map((d) => {
          const outside = !isSameMonth(d, month);
          const sel = isSameDay(d, selected);
          const today = isToday(d);
          return (
            <button
              type="button"
              key={d.toISOString()}
              onClick={() => handleSelect(d)}
              className={cx(
                "inline-flex items-center justify-center rounded-md transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200",
                cell,
                outside && "text-zinc-300 hover:bg-transparent",
                !outside && "hover:bg-zinc-100",
                today && !sel && "ring-2 ring-cyan-300",
                sel && "bg-cyan-500 text-white hover:bg-cyan-500"
              )}
              title={format(d, "PPPP")}
              aria-label={format(d, "yyyy-MM-dd")}
              aria-selected={sel}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
