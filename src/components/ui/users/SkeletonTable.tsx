import * as React from "react";

export default function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="h-11 w-full bg-zinc-50" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-zinc-100 animate-pulse" />
          <div className="h-4 w-40 rounded bg-zinc-100 animate-pulse" />
          <div className="ml-auto h-8 w-48 rounded bg-zinc-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
