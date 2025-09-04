import * as React from "react";
import { Link } from "react-router-dom";
import { Star, StarOff, MoreHorizontal, CalendarClock } from "lucide-react";
import type { Board } from "@/features/boards/types";
import AvatarStack from "./AvatarStack";
import PrivacyChip from "./PrivacyChip";
import { timeAgo } from "@/features/boards/utils";
import { TOKENS } from "@/lib/tokens";

type Props = { board: Board; onToggleStar: (id: number) => void };

export default function BoardCard({ board, onToggleStar }: Props) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow",
        "border-zinc-200 hover:shadow-md hover:border-[rgb(34,211,238)]",
      ].join(" ")}
    >
      <Link to={`/boards/${board.id}`} className="block">
        <div
          className="h-24 w-full"
          style={{ background: board.cover ?? `linear-gradient(135deg, ${TOKENS.accent} 0%, rgba(34,211,238,0.15) 100%)` }}
        />
      </Link>

      <button
        onClick={() => onToggleStar(board.id)}
        className="absolute right-2 top-2 inline-grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow ring-1 ring-zinc-200 transition hover:bg-white"
        title={board.isStarred ? "Unstar" : "Star"}
      >
        {board.isStarred ? <Star className="h-4 w-4" style={{ color: TOKENS.accent }} /> : <StarOff className="h-4 w-4 text-zinc-600" />}
      </button>

      <div className="p-3">
        <div className="mb-1 flex items-center justify-between">
          <Link to={`/boards/${board.id}`} className="line-clamp-1 font-semibold text-zinc-900 hover:underline">
            {board.title}
          </Link>
          <button className="inline-grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100" title="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          {board.teamName && (
            <span
              className="inline-flex items-center rounded-md border bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700"
              style={{ borderColor: "rgba(34,211,238,.45)" }}
            >
              {board.teamName}
            </span>
          )}
          <PrivacyChip privacy={board.privacy} />
        </div>

        <div className="flex items-center justify-between">
          <AvatarStack members={board.members} />
          <div className="flex items-center gap-1 text-[12px] text-zinc-500">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Active {timeAgo(board.lastActivity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
