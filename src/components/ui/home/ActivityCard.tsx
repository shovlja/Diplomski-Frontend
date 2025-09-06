// src/components/ui/home/ActivityCard.tsx
import * as React from "react";

type Props = {
  series: number[];
  className?: string;    // npr. h-full kad želiš da ga rastegne roditelj
  barHeight?: number;    // maksimalna visina stubića u px (default 220)
  tightScale?: boolean;  // koristi realni max iz serije (default true = viši stubići)
};

export default function ActivityCard({
  series,
  className,
  barHeight = 220,
  tightScale = true,
}: Props) {
  // “zategnuta” skala: koristi realni maksimum kako bi stubići bili viši.
  // ako želiš da ih ‘spustiš’, stavi tightScale={false} pa će minimum biti 100.
  const maxRaw = Math.max(...series, 1);
  const max = tightScale ? maxRaw : Math.max(maxRaw, 100);

  return (
    <div
      className={[
        "rounded-xl border border-zinc-200 bg-white",
        "shadow-[0_1px_0_rgba(0,0,0,.05),0_8px_24px_rgba(0,0,0,.06)]",
        "p-4",
        className ?? "h-[460px]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">Activity (last 7 days)</div>
          <div className="text-xs text-zinc-500">Tasks updated, comments, card moves</div>
        </div>
        <button className="text-sm text-cyan-600 hover:underline">View reports</button>
      </div>

      {/* plot area */}
      <div className="mt-4 flex h-[calc(100%-3.5rem)] flex-col">
        {/* malo veći padding i smanjen ‘gornji luft’ za više stubiće */}
        <div className="flex grow items-end gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          {series.map((v, i) => {
            // viši stubići: veći barHeight + skala po realnom max-u
            const h = Math.max(24, Math.round((v / max) * barHeight));
            return (
              <div key={i} className="flex w-full flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-cyan-500/80 shadow-[inset_0_1px_0_rgba(255,255,255,.4)]"
                  style={{ height: `${h}px` }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-2 grid grid-cols-7 text-center text-xs text-zinc-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
