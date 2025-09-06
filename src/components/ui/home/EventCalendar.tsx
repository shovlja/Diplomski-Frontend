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

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

type Props = {
  value?: Date;
  onChange?: (d: Date) => void;
  onAdd?: (d: Date) => void;
  weekStartsOn?: 0|1|2|3|4|5|6;
  className?: string;
  /** Ako proslediš, umesto default dugmeta ispod grida renduje se tvoj footer. */
  renderFooter?: (selected: Date) => React.ReactNode;
};

export default function EventCalendar({
  value,
  onChange,
  onAdd,
  weekStartsOn = 1,
  className,
  renderFooter,
}: Props) {
  const initial = value ?? new Date();
  const [month, setMonth] = React.useState(startOfMonth(initial));
  const [selected, setSelected] = React.useState(initial);

  React.useEffect(() => {
    if (value) {
      setSelected(value);
      setMonth(startOfMonth(value));
    }
  }, [value]);

  const first = startOfWeek(startOfMonth(month), { weekStartsOn });
  const days: Date[] = React.useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(first, i)),
    [first]
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "1px",
  };

  const select = (d: Date) => {
    setSelected(d);
    onChange?.(d);
  };

  return (
    <div className={cx("w-full", className)}>
      {/* Header */}
      <div className="mb-1 grid grid-cols-3 items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, -1))}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-zinc-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center text-sm font-semibold text-zinc-900">
            <span>{format(month, "MMMM")}</span>{" "}
            <span className="text-zinc-500 font-normal">{format(month, "yyyy")}</span>
        </div>


        <div className="flex items-center justify-end">
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
      <div className="mt-1 grid grid-cols-7 text-center text-[11px] font-medium text-zinc-500">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(first, i);
          return (
            <div key={i} className="py-1">
              {format(d, "EEEEE")}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="mt-2 rounded-2xl bg-zinc-200/70 p-[1px]">
        <div style={gridStyle} className="rounded-2xl bg-zinc-200/70">
          {days.map((d) => {
            const outside = !isSameMonth(d, month);
            const sel = isSameDay(d, selected);
            const today = isToday(d);

            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => select(d)}
                title={format(d, "PPPP")}
                aria-label={format(d, "yyyy-MM-dd")}
                aria-selected={sel}
                className={cx(
                  "relative h-12 bg-white text-center transition",
                  "hover:bg-zinc-50 focus:outline-none",
                  outside && "bg-zinc-50 text-zinc-300 hover:bg-zinc-50"
                )}
              >
                <span
                  className={cx(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "inline-flex items-center justify-center rounded-full",
                    "h-8 w-8 text-[13px]",
                    today && !sel && "ring-2 ring-cyan-300",
                    sel
                      ? "text-white bg-[color:var(--accent-on-dark,#0EA5E9)]"
                      : "text-zinc-700"
                  )}
                >
                  {format(d, "d")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {renderFooter ? (
        <div className="mt-4">{renderFooter(selected)}</div>
      ) : (
        <button
          type="button"
          onClick={() => onAdd?.(selected)}
          className="mt-4 h-11 w-full rounded-xl bg-[color:var(--accent-on-dark,#0EA5E9)]
                     text-white text-[15px] font-medium hover:brightness-95 active:translate-y-[0.5px] transition"
        >
          Add event
        </button>
      )}
    </div>
  );
}
