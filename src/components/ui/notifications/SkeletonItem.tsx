import * as React from "react";

export default function SkeletonItem() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-2/3 rounded bg-zinc-100" />
        <div className="h-4 w-16 rounded bg-zinc-100" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-8 w-24 rounded bg-zinc-100" />
        <div className="h-8 w-24 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
