import * as React from "react";
import Card from "./Card";

/** Jednostavan pie/donut bez biblioteka (CSS conic-gradient) */
export default function PieCard({
  title = "Work distribution",
  data = [
    { label: "Backlog", value: 35, color: "#93C5FD" }, // blue-300
    { label: "In progress", value: 25, color: "#22D3EE" }, // cyan-400
    { label: "Review", value: 15, color: "#FBBF24" }, // amber-400
    { label: "Done", value: 25, color: "#34D399" }, // emerald-400
  ],
}: {
  title?: string;
  data?: Array<{ label: string; value: number; color: string }>;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const stops = data
    .map((d) => {
      const start = (acc / total) * 360;
      acc += d.value;
      const end = (acc / total) * 360;
      return `${d.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-900">{title}</div>
      </div>

      <div className="flex items-center gap-4">
        {/* Pie */}
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          aria-label="Pie chart"
        >
          <div className="absolute inset-4 rounded-full bg-white" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-xs text-zinc-500">Total</div>
              <div className="text-xl font-semibold text-zinc-900">{total}</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="grow space-y-2">
          {data.map((d) => (
            <li key={d.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-zinc-700">{d.label}</span>
              </div>
              <span className="text-sm font-medium text-zinc-900">
                {Math.round((d.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
