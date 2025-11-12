import * as React from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { LabelItem } from "@/features/boards/board";

type LabelsPopoverProps = {
  open: boolean;
  /** Prosleđujemo konkretan element (ne RefObject) da izbegnemo TS konflikte */
  anchorEl: HTMLElement | null;
  onClose: () => void;

  /** Katalog labela ZA CEO BOARD + checked za aktuelnu karticu */
  labels: LabelItem[];
  onToggle: (id: number) => void;

  onCreate: (payload: { name: string; color: string }) => Promise<void> | void;
  onUpdate: (payload: { id: number; name: string; color: string }) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
};

type EditorState =
  | { mode: "create"; id?: undefined; name: string; color: string }
  | { mode: "edit"; id: number; name: string; color: string }
  | null;

const PALETTE: string[] = [
  "#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#a855f7",
  "#06b6d4", "#3b82f6", "#0ea5e9", "#14b8a6", "#64748b", "#94a3b8",
  "#16a34a", "#65a30d", "#f59e0b", "#fb7185", "#d946ef", "#8b5cf6",
  "#0284c7", "#2563eb", "#0891b2", "#0d9488", "#475569", "#cbd5e1",
];

export default function LabelsPopover({
  open,
  anchorEl,
  onClose,
  labels,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
}: LabelsPopoverProps) {
  const popRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [editor, setEditor] = React.useState<EditorState>(null);

  React.useEffect(() => {
    if (!open || !anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    const width = 320;
    const top = r.bottom + window.scrollY + 10;
    let left = r.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - width - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    setPos({ top, left });
  }, [open, anchorEl]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const p = popRef.current;
      const t = e.target as Node;
      if (p && !p.contains(t) && anchorEl && !anchorEl.contains(t)) {
        onClose();
        setEditor(null);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (onClose(), setEditor(null));
    document.addEventListener("mousedown", onDoc, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  const startCreate = () => setEditor({ mode: "create", name: "", color: PALETTE[0] });
  const startEdit = (l: LabelItem) => setEditor({ mode: "edit", id: l.id, name: l.name, color: l.color });

  const saveEditor = async () => {
    if (!editor) return;
    const name = editor.name.trim();
    if (name.length < 2) return;
    if (editor.mode === "create") {
      await onCreate({ name, color: editor.color });
    } else {
      await onUpdate({ id: editor.id, name, color: editor.color });
    }
    setEditor(null);
  };

  return createPortal(
    <div
      ref={popRef}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60, width: 320 }}
      className="rounded-xl border border-zinc-200 bg-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200">
        <div className="text-sm font-semibold text-zinc-800">
          {editor?.mode === "edit" ? "Edit label" : editor?.mode === "create" ? "Create label" : "Labels"}
        </div>
        <button
          onClick={() => { onClose(); setEditor(null); }}
          className="inline-grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          aria-label="Close"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        {editor ? (
          <>
            <div className="mb-3 h-10 w-full rounded-md" style={{ backgroundColor: editor.color }} aria-hidden />
            <label className="block text-xs font-medium text-zinc-600 mb-1">Title</label>
            <input
              value={editor.name}
              onChange={(e) => setEditor({ ...editor, name: e.currentTarget.value })}
              placeholder="Label title"
              className="mb-3 w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            />
            <div className="mb-2 text-xs font-medium text-zinc-600">Select a color</div>
            <div className="grid grid-cols-6 gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditor({ ...editor, color: c })}
                  className="relative h-9 rounded-md border border-zinc-200 focus:outline-none cursor-pointer"
                  style={{ backgroundColor: c }}
                  type="button"
                  title={c}
                >
                  {editor.color === c && <Check className="absolute right-1 top-1 h-4 w-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              {editor.mode === "edit" && (
                <button
                  onClick={async () => { if (editor.mode === "edit") await onDelete(editor.id); setEditor(null); }}
                  className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 cursor-pointer"
                  type="button"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
              <button
                onClick={() => setEditor(null)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={saveEditor}
                className="rounded-md bg-[#177de5] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-95 cursor-pointer"
                type="button"
              >
                {editor.mode === "edit" ? "Save" : "Create"}
              </button>
            </div>
          </>
        ) : (
          <>
            {labels.length === 0 ? (
              <div className="text-sm text-zinc-600 mb-3">No labels yet.</div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1 mb-3">
                {labels.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-zinc-50 cursor-pointer">
                    <input type="checkbox" checked={!!l.checked} onChange={() => onToggle(l.id)} className="mt-0.5" />
                    <span
                      className="inline-flex h-6 min-w-[64px] items-center justify-center rounded-md px-2 text-xs font-semibold text-white"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.name}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); startEdit(l); }}
                      className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                      type="button"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={startCreate}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                type="button"
              >
                Create new
              </button>
              <button
                onClick={onClose}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                type="button"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
