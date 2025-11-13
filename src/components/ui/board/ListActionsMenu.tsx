import * as React from "react";
import { createPortal } from "react-dom";

export default function ListActionsMenu({
  open,
  onClose,
  anchorRef,
  onAddCard,
  onCopyList,
  onMoveList,
  onMoveAllCards,
  onWatch,
  onArchiveList,
  onArchiveAllCards,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  onAddCard: () => void;
  onCopyList: () => void;
  onMoveList: () => void;
  onMoveAllCards: () => void;
  onWatch: () => void;
  onArchiveList: () => void;
  onArchiveAllCards: () => void;
}) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current;
    if (!a) return;
    const rect = a.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();

    const onClick = (e: MouseEvent) => {
      const m = menuRef.current;
      const a = anchorRef.current;
      if (m && !m.contains(e.target as Node) && a && !a.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onReflow = () => updatePosition();

    document.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  if (!open) return null;

  const body = (
    <div
      ref={menuRef}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-xl"
    >
      <div className="px-2 pb-2 text-xs font-semibold tracking-wide text-zinc-500">List actions</div>
      <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-50" onClick={onAddCard}>
        Add card
      </button>
      <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-50" onClick={onCopyList}>
        Copy list
      </button>
      <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-50" onClick={onMoveList}>
        Move list
      </button>
      <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-50" onClick={onMoveAllCards}>
        Move all cards
      </button>
      <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-zinc-50" onClick={onWatch}>
        Watch
      </button>
      <div className="my-2 h-px bg-zinc-200" />
      <button
        className="block w-full rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
        onClick={onArchiveList}
      >
        Archive this list
      </button>
      <button
        className="block w-full rounded-md px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
        onClick={onArchiveAllCards}
      >
        Archive all cards in this list
      </button>
    </div>
  );

  return createPortal(body, document.body);
}
