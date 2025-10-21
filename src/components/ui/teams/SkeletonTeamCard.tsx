import * as React from "react";

export default function SkeletonTeamCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="h-24 w-full bg-zinc-100" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-2/3 rounded bg-zinc-100" />
        <div className="h-3 w-1/3 rounded bg-zinc-100" />
        <div className="h-7 w-full rounded bg-zinc-100" />
      </div>
    </div>
  );
}
