import * as React from "react";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return { date, time };
}

function getDueState(iso: string | null, complete: boolean) {
  if (!iso) return { state: "none" as const, label: "" };
  if (complete) return { state: "complete" as const, label: "Complete" };
  const now = new Date().getTime();
  const due = new Date(iso).getTime();
  const diff = due - now;
  const soon = 24 * 60 * 60 * 1000;
  if (diff < 0) return { state: "overdue" as const, label: "Overdue" };
  if (diff <= soon) return { state: "soon" as const, label: "Due soon" };
  return { state: "scheduled" as const, label: "" };
}

export default function DueBadge({
  value,
  complete,
  onToggleComplete,
}: {
  value: string | null;
  complete: boolean;
  onToggleComplete: (next: boolean) => void;
}) {
  if (!value) return null;
  const { date, time } = formatDateTime(value);
  const s = getDueState(value, complete);

  const pillBase =
    "inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm bg-white";
  const tone =
    s.state === "complete"
      ? "border-emerald-300 text-emerald-700"
      : s.state === "overdue"
      ? "border-rose-300 text-rose-700"
      : s.state === "soon"
      ? "border-amber-300 text-amber-700"
      : "border-zinc-300 text-zinc-700";

  const chipBase = "rounded px-1.5 py-0.5 text-xs";
  const chipTone =
    s.state === "complete"
      ? "bg-emerald-100 text-emerald-700"
      : s.state === "overdue"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  return (
    <label className={`${pillBase} ${tone} cursor-pointer select-none`}>
      <input
        type="checkbox"
        checked={complete}
        onChange={(e) => onToggleComplete(e.target.checked)}
      />
      <span className="font-medium">{date}</span>
      <span className="text-zinc-500">{time}</span>
      {s.label ? <span className={`${chipBase} ${chipTone}`}>{s.label}</span> : null}
    </label>
  );
}
