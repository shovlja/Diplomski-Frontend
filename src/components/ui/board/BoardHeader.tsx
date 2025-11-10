import * as React from "react";

export default function BoardHeader({
  title,
  rightAction,
}: {
  title: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <div
      className="
        sticky top-0 z-10 flex items-center gap-3
        border-b border-zinc-200
        bg-gradient-to-b from-white to-zinc-50/70
        px-4 py-3 backdrop-blur
      "
    >
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      <div className="ml-auto">{rightAction}</div>
    </div>
  );
}
