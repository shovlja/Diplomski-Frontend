import * as React from "react";

type Props = {
  filter: "all" | "unread" | "actionable";
  setFilter: (v: Props["filter"]) => void;
  counts: { all: number; unread: number; actionable: number };
};

export default function NotificationsToolbar({ filter, setFilter, counts }: Props) {
  const items: { key: Props["filter"]; label: string; count: number }[] = [
    { key: "all",        label: "All",        count: counts.all },
    { key: "unread",     label: "Unread",     count: counts.unread },
    { key: "actionable", label: "Actionable", count: counts.actionable },
  ];

  return (
    <div className="mb-4 flex justify-end">
      <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
        {items.map(({ key, label, count }) => {
          const active = key === filter;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={[
                "cursor-pointer rounded-full px-4 py-2 text-sm transition",
                active
                  ? "bg-white text-zinc-900 ring-2 ring-cyan-200 shadow-[0_0_0_3px_rgba(34,211,238,.20)]"
                  : "text-zinc-600 hover:text-zinc-800",
              ].join(" ")}
              title={label}
            >
              {label}{count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
