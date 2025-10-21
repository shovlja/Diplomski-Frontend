// src/components/ui/home/UpcomingCard.tsx
import * as React from "react";

export default function UpcomingCard() {
  // mock lista — možeš kasnije povezati na backend
  const items = [
    { t: "Sprint review – Core", sub: "Board: PMHub",       when: "Tomorrow, 10:00" },
    { t: "1:1 with Ana",         sub: "People",             when: "Wed, 14:00" },
    { t: "Design sync",          sub: "Teams",              when: "Thu, 09:30" },
    { t: "3 issues due",         sub: "My tasks",           when: "Fri" },
    { t: "Marketing sync",       sub: "Board: Marketing",   when: "Mon, 11:30" },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)] p-4 h-[460px]">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">Upcoming</div>
          <div className="text-xs text-zinc-500">Next 7 days</div>
        </div>
        <button className="text-xs text-cyan-600 hover:underline">Open planning</button>
      </div>

      {/* samo jedna linija iznad prve stavke (full-bleed) */}
      <div className="-mx-4 mb-0 h-px bg-zinc-200" />

      <div className="mt-0 h-[356px] overflow-y-auto overflow-x-hidden">
        <ul className="divide-y divide-zinc-200">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-zinc-900">{it.t}</div>
                <div className="text-xs text-zinc-500">{it.sub}</div>
              </div>
              <div className="ml-4 shrink-0 text-sm text-zinc-600">{it.when}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
