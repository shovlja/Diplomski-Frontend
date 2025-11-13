import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ChecklistPopover({
  open,
  anchorRef,
  onClose,
  onSave,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onSave: (title: string) => void; // samo naslov, stavke se dodaju posle
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [title, setTitle] = React.useState("Checklist");
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    const onClick = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const onReflow = () => updatePosition();
    document.addEventListener("click", onClick, true);
    window.addEventListener("resize", onReflow, true);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onReflow, true);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  if (!open) return null;

  const body = (
    <div
      ref={ref}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-[360px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">Add checklist</div>
        <button className="rounded-md p-1 hover:bg-zinc-100" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <label className="mb-1 block text-xs font-medium text-zinc-600">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-cyan-500"
      />

      <div className="flex items-center gap-2">
        <button
          className="rounded-md bg-[#1991EB] px-3 py-1.5 text-sm font-medium text-white"
          onClick={() => onSave(title.trim() || "Checklist")}
        >
          Add
        </button>
        <button className="rounded-md px-3 py-1.5 text-sm hover:bg-zinc-50" onClick={onClose}>
          Remove
        </button>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
