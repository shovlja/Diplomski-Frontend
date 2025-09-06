// src/components/ui/home/UpcomingCard.tsx
import * as React from "react";
import { Link } from "react-router-dom";

type Item = {
  title: string;
  sub: string;   // npr. "Board: PMHub" ili "People"
  when: string;  // npr. "Tomorrow, 10:00"
};

const mockItems: Item[] = [
  { title: "Sprint review – Core", sub: "Board: PMHub", when: "Tomorrow, 10:00" },
  { title: "1:1 with Ana",        sub: "People",        when: "Wed, 14:00" },
  { title: "Design sync",         sub: "Teams",         when: "Thu, 09:30" },
  { title: "3 issues due",        sub: "My tasks",      when: "Fri" },
  { title: "Marketing sync",      sub: "Board: Marketing", when: "Mon, 11:30" },
];

export default function UpcomingCard({ items = mockItems }: { items?: Item[] }) {
  return (
    <div
      className="
        rounded-xl border border-zinc-200 bg-white
        shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]
        h-[460px] flex flex-col
      "
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-end justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">Upcoming</div>
          <div className="text-xs text-zinc-500">Next 7 days</div>
        </div>
        <Link
          to="/?v=sprints"
          className="text-sm text-cyan-600 hover:underline whitespace-nowrap"
        >
          Open planning
        </Link>
      </div>

      {/* List – Y scroll, X hidden; bez globalnog divide-y */}
      <ul className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {items.map((it, idx) => (
          <li
            key={`${it.title}-${idx}`}
            className={[
              // samo iznad prvog reda povuci tanku liniju
              idx === 0 ? "border-t border-zinc-200" : "",
              "px-4 py-3",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-zinc-900 truncate">{it.title}</div>
                <div className="text-xs text-zinc-500">{it.sub}</div>
              </div>
              <div className="text-sm text-zinc-600 whitespace-nowrap">{it.when}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
