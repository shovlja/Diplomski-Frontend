import * as React from "react";
import { createPortal } from "react-dom";

type MemberRow = { id: string; name: string };

export default function MembersPopover({
  open,
  onClose,
  anchorRef,
  team,
  initialSelected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  team: MemberRow[];
  initialSelected?: string[];
  onSave: (ids: string[]) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const [selected, setSelected] = React.useState<string[]>(initialSelected ?? []);
  React.useEffect(() => setSelected(initialSelected ?? []), [initialSelected]);

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current;
    if (!a) return;
    const rect = a.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();

    const onClick = (e: MouseEvent) => {
      const m = ref.current;
      const a = anchorRef.current;
      if (m && !m.contains(e.target as Node) && a && !a.contains(e.target as Node)) onClose();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const body = (
    <div
      ref={ref}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 text-sm font-semibold text-zinc-700">Members</div>
      <div className="max-h-64 space-y-1 overflow-auto pr-1">
        {team.map((m) => (
          <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-zinc-50">
            <input
              type="checkbox"
              checked={selected.includes(m.id)}
              onChange={() => toggle(m.id)}
            />
            <span className="text-sm text-zinc-800">{m.name}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded-md bg-[#1991EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#1586dc]"
          onClick={() => {
            onSave(selected);
            onClose();
          }}
        >
          Save
        </button>
        <button
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
