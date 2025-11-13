import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type DatesResult = { due: string | null; complete: boolean };

function toISO(d: Date, hh: number, mm: number) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0);
  return x.toISOString();
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const fmt2 = (n: number) => String(n).padStart(2, "0");

export default function DatesPopover({
  open,
  anchorRef,
  value,
  complete,
  onClose,
  onSave,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  value: string | null;
  complete: boolean;
  onClose: () => void;
  onSave: (v: DatesResult) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const base = value ? new Date(value) : new Date();
  const [month, setMonth] = React.useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const [selected, setSelected] = React.useState<Date | null>(value ? new Date(value) : null);

  // HH/MM kao *stringovi* da bi uvek imali dve cifre (00..)
  const [hhStr, setHhStr] = React.useState<string>(fmt2(value ? new Date(value).getHours() : 14));
  const [mmStr, setMmStr] = React.useState<string>(fmt2(value ? new Date(value).getMinutes() : 0));
  const [markComplete, setMarkComplete] = React.useState<boolean>(complete);

  // sync kada se otvori ili promeni value
  React.useEffect(() => {
    if (!open) return;
    const d = value ? new Date(value) : new Date();
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelected(value ? new Date(value) : null);
    setHhStr(fmt2(value ? d.getHours() : 14));
    setMmStr(fmt2(value ? d.getMinutes() : 0));
    setMarkComplete(complete);
  }, [open, value, complete]);

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current as HTMLElement | null;
    if (!a) return;
    const r = a.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    const onReflow = () => updatePosition();
    document.addEventListener("click", onClick, true);
    window.addEventListener("resize", onReflow, true);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onReflow, true);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  if (!open) return null;

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay(); // 0 = Sun
  const weeks: (Date | null)[] = [];
  const pad = (firstWeekday + 6) % 7; // start Monday
  for (let i = 0; i < pad; i++) weeks.push(null);
  for (let d = 1; d <= daysInMonth; d++) weeks.push(new Date(month.getFullYear(), month.getMonth(), d));

  const parseHH = () => clamp(parseInt(hhStr || "0", 10), 0, 23);
  const parseMM = () => clamp(parseInt(mmStr || "0", 10), 0, 59);

  const onlyDigits = (s: string) => s.replace(/[^\d]/g, "").slice(0, 2);

  const body = (
    <div
      ref={ref}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-[320px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">Dates</div>
        <button className="rounded-md p-1 hover:bg-zinc-100" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm">
        <button className="rounded-md p-1 hover:bg-zinc-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></button>
        <div className="font-medium">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
        <button className="rounded-md p-1 hover:bg-zinc-100" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <div key={d} className="py-1">{d}</div>)}
        {weeks.map((d, i) =>
          d ? (
            <button
              key={i}
              onClick={() => setSelected(d)}
              className={[
                "rounded-md py-1.5 text-sm hover:bg-zinc-100",
                selected && d.toDateString() === selected.toDateString() ? "bg-cyan-100 text-cyan-700" : ""
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          ) : <div key={i} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          inputMode="numeric"
          value={hhStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHhStr(onlyDigits(e.currentTarget.value))}
          onBlur={() => setHhStr(fmt2(clamp(parseInt(hhStr || "0", 10), 0, 23)))}
          placeholder="hh"
          className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
        :
        <input
          inputMode="numeric"
          value={mmStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMmStr(onlyDigits(e.currentTarget.value))}
          onBlur={() => setMmStr(fmt2(clamp(parseInt(mmStr || "0", 10), 0, 59)))}
          placeholder="mm"
          className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-sm"
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={markComplete} onChange={(e) => setMarkComplete(e.currentTarget.checked)} />
        <span>Mark complete</span>
      </label>

      <div className="mt-3 flex items-center justify-between">
        <button
          className="rounded-md px-3 py-1.5 text-sm hover:bg-zinc-50"
          onClick={() => { onSave({ due: null, complete: false }); onClose(); }}
        >
          Remove
        </button>
        <button
          className="rounded-md bg-[#1991EB] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            const iso = toISO(selected, parseHH(), parseMM());
            onSave({ due: iso, complete: markComplete });
            onClose();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
