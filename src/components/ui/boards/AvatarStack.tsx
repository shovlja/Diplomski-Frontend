import * as React from "react";
import type { Member } from "@/features/boards/types";

export default function AvatarStack({ members }: { members: Member[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 5).map((m) => (
        <div
          key={m.id}
          className="inline-grid h-7 w-7 place-items-center rounded-full ring-2 ring-white bg-zinc-200 text-[11px] font-medium text-zinc-700 overflow-hidden"
          title={m.name}
        >
          {m.avatarUrl ? (
            <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
          ) : (
            <span>{m.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}</span>
          )}
        </div>
      ))}
      {members.length > 5 && (
        <div className="inline-grid h-7 w-7 place-items-center rounded-full ring-2 ring-white bg-zinc-100 text-[11px] text-zinc-600">
          +{members.length - 5}
        </div>
      )}
    </div>
  );
}
