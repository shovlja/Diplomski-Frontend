// src/components/ui/home/ActivityCard.tsx
import * as React from "react";

type Props = { series: number[]; barMax?: number };

export default function ActivityCard({ series }: Props) {
  const max = Math.max(...series, 1);
  // više "mesa" na grafu — visina bara do ~180px
  const scale = (v: number) => Math.max(10, Math.round((v / max) * 180));

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)] p-4 h-[460px]">
      <div className="text-sm font-medium text-zinc-900">Activity (last 7 days)</div>
      <div className="text-xs text-zinc-500">Tasks updated, comments, card moves</div>

      <div className="mt-4 flex h-[260px] items-end gap-4 rounded-md border border-zinc-200 bg-zinc-50 p-4">
        {series.map((v, i) => (
          <div key={i} className="flex w-full flex-col items-center">
            <div
              className="w-full rounded-md bg-cyan-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,.4)]"
              style={{ height: `${scale(v)}px` }}
              title={`${days[i]}: ${v}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-xs text-zinc-500">
        {days.map((d) => <div key={d}>{d}</div>)}
      </div>
    </div>
  );
}
