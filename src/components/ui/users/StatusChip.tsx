import * as React from "react";

export default function StatusChip({ active }: { active: boolean }) {
  const cls = active
    ? "text-emerald-700 border-emerald-200 bg-emerald-50"
    : "text-zinc-600 border-zinc-200 bg-white";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] border ${cls}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
