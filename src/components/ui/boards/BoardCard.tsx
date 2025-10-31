import * as React from "react";
import { Link } from "react-router-dom";
import { Star, StarOff, MoreHorizontal, CalendarClock, TriangleAlert } from "lucide-react";
import type { Board } from "@/features/boards/types";
import AvatarStack from "./AvatarStack";
import PrivacyChip from "./PrivacyChip";
import { timeAgo } from "@/features/boards/utils";
import { TOKENS } from "@/lib/tokens";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { deleteBoard } from "@/features/boards/api";

type Props = {
  board: Board;
  onToggleStar: (id: number) => void;
  onDeleted?: (id: number) => void;
  onEdit?: (board: Board) => void;
};

export default function BoardCard({ board, onToggleStar, onDeleted, onEdit }: Props) {
  const [openMenu, setOpenMenu] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (evt: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(evt.target as Node)) setOpenMenu(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const handleDelete = async () => {
    setConfirmOpen(false);
    const id = board.id;
    onDeleted?.(id); // optimistično uklanjanje iz liste/reload
    try {
      await deleteBoard(id);
      toast.success("Board deleted.");
    } catch {
      toast.error("Failed to delete board.");
    }
  };

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

      {/* ... meni samo za owner-a */}
      {board.isOwner && (
        <div ref={menuRef} className="absolute right-2 top-12">
          <button
            onClick={(evt) => {
              evt.stopPropagation();
              setOpenMenu((s) => !s);
            }}
            className="inline-grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100"
            title="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {openMenu && (
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
              <button
                className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                onClick={() => {
                  setOpenMenu(false);
                  onEdit?.(board);
                }}
              >
                Update board
              </button>
              <button
                className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                onClick={() => {
                  setOpenMenu(false);
                  setConfirmOpen(true);
                }}
              >
                Delete board
              </button>
            </div>
          )}
        </div>
      )}

      <div className="p-3">
        <div className="mb-1 flex items-center justify-between">
          <Link to={`/boards/${board.id}`} className="line-clamp-1 font-semibold text-zinc-900 hover:underline">
            {board.title}
          </Link>
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-2">
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

        {/* tagovi */}
        {board.tags && board.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {board.tags.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <AvatarStack members={board.members} />
          <div className="flex items-center gap-1 text-[12px] text-zinc-500">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Active {timeAgo(board.lastActivity)}</span>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4" onClick={() => setConfirmOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2 text-rose-600">
              <TriangleAlert className="h-5 w-5" />
              <h4 className="text-base font-semibold">Delete board?</h4>
            </div>
            <p className="mb-5 text-sm text-zinc-700">
              This action will permanently delete the board and all its data. Team members linked to this board will lose access and the board cannot be recovered.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
