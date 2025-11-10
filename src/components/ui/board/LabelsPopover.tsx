import * as React from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, Check, Pencil, Trash2 } from "lucide-react";
import type { LabelItem } from "@/features/boards/board";

type Props = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  labels: LabelItem[];
  onToggle: (id: number) => void;
  onCreate?: (label: LabelItem) => void;
  onUpdate?: (label: LabelItem) => void;
  onDelete?: (id: number) => void;
};

const POPOVER_W = 320;       // w-80
const POPOVER_MAX_H = 420;   // max-height; content scrolls when exceeded

const COLORS = [
  "#15803D", "#A16207", "#B45309", "#B91C1C", "#7C3AED",
  "#16A34A", "#65A30D", "#CA8A04", "#EF4444", "#A855F7",
  "#0EA5E9", "#059669", "#22C55E", "#EA580C", "#D946EF",
  "#60A5FA", "#38BDF8", "#22D3EE", "#FB7185", "#9CA3AF",
];

type Mode = "list" | "create" | "edit" | "confirm-delete";

export default function LabelsPopover({
  open,
  onClose,
  anchorRef,
  labels,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const [mode, setMode] = React.useState<Mode>("list");
  const [search, setSearch] = React.useState("");

  // draft za create/edit/delete
  const [draftId, setDraftId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const [color, setColor] = React.useState<string | null>(COLORS[0]);

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current;
    if (!a) return;
    const rect = a.getBoundingClientRect();

    let left = rect.left + window.scrollX;
    const maxLeft = window.scrollX + window.innerWidth - POPOVER_W - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);

    // koristimo MAX visinu za “ne pređi ekran”
    let top = rect.bottom + window.scrollY + 6;
    const maxTop = window.scrollY + window.innerHeight - POPOVER_MAX_H - 8;
    if (top > maxTop) top = Math.max(8 + window.scrollY, maxTop);

    setPos({ top, left });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;

    // reset pri otvaranju
    setMode("list");
    setDraftId(null);
    setTitle("");
    setColor(COLORS[0]);
    setSearch("");

    updatePosition();

    const onDocClick = (e: MouseEvent) => {
      const m = menuRef.current;
      const a = anchorRef.current;
      if (m && !m.contains(e.target as Node) && !(a && a.contains(e.target as Node))) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onReflow = () => updatePosition();

    document.addEventListener("click", onDocClick, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onReflow, true);
    window.addEventListener("resize", onReflow, true);
    return () => {
      document.removeEventListener("click", onDocClick, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("resize", onReflow, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  if (!open) return null;

  const startCreate = () => {
    setMode("create");
    setDraftId(null);
    setTitle("");
    setColor(COLORS[0]);
  };

  const startEdit = (l: LabelItem) => {
    setMode("edit");
    setDraftId(l.id);
    setTitle(l.name);
    setColor(l.color ?? "#9CA3AF");
  };

  const startDeleteConfirm = (id: number) => {
    setDraftId(id);
    setMode("confirm-delete");
  };

  const filtered = labels.filter((l) =>
    l.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 60,
        width: POPOVER_W,
        maxHeight: POPOVER_MAX_H,
      }}
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {mode === "list" && (
        <ListView
          labels={filtered}
          search={search}
          setSearch={setSearch}
          onToggle={onToggle}
          onClose={onClose}
          onGoCreate={startCreate}
          onGoEdit={startEdit}
        />
      )}

      {mode === "create" && (
        <EditorView
          kind="Create label"
          title={title}
          color={color}
          setTitle={setTitle}
          setColor={setColor}
          onBack={() => setMode("list")}
          onClose={onClose}
          onSubmit={() => {
            const id = Math.floor(Math.random() * 1e9);
            const newLabel: LabelItem = { id, name: title.trim() || "New label", color: color ?? "#9CA3AF", checked: true };
            onCreate?.(newLabel);
            setMode("list");
          }}
        />
      )}

      {mode === "edit" && (
        <EditorView
          kind="Edit label"
          title={title}
          color={color}
          setTitle={setTitle}
          setColor={setColor}
          onBack={() => setMode("list")}
          onClose={onClose}
          onSubmit={() => {
            if (draftId == null) return;
            const updated: LabelItem = { id: draftId, name: title.trim() || "Label", color: color ?? "#9CA3AF", checked: true };
            onUpdate?.(updated);
            setMode("list");
          }}
          onDeleteClick={() => draftId != null && startDeleteConfirm(draftId)}
        />
      )}

      {mode === "confirm-delete" && (
        <ConfirmDeleteView
          onBack={() => setMode("list")}
          onClose={onClose}
          onConfirm={() => {
            if (draftId != null) onDelete?.(draftId);
            setMode("list");
          }}
        />
      )}
    </div>,
    document.body
  );
}

/* ---------------- Views ---------------- */

function ListView({
  labels,
  search,
  setSearch,
  onToggle,
  onClose,
  onGoCreate,
  onGoEdit,
}: {
  labels: LabelItem[];
  search: string;
  setSearch: (v: string) => void;
  onToggle: (id: number) => void;
  onClose: () => void;
  onGoCreate: () => void;
  onGoEdit: (l: LabelItem) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col p-3">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-700">Labels</div>
        <button
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          onClick={onClose}
          type="button"
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* content (scroll on overflow) */}
      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search labels..."
          className="mb-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />

        <div className="space-y-1">
          {labels.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-md px-1.5 py-1 hover:bg-zinc-50"
            >
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!l.checked}
                  onChange={() => onToggle(l.id)}
                  className="accent-[#177de5] cursor-pointer"
                />
                <span
                  className="inline-block h-5 w-8 rounded"
                  style={{ backgroundColor: l.color ?? "#9CA3AF" }}
                  title={l.name}
                />
                <span className="text-sm text-zinc-800">{l.name}</span>
              </label>

              {/* EDIT (olovka) */}
              <button
                className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onGoEdit(l); }}
                type="button"
                aria-label="Edit label"
                title="Edit label"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}

          {labels.length === 0 && (
            <div className="py-6 text-center text-sm text-zinc-500">No labels match your search.</div>
          )}
        </div>
      </div>

      {/* footer */}
      <div className="pt-3">
        <button
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 cursor-pointer"
          onClick={onGoCreate}
          type="button"
          title="Create a new label"
        >
          Create a new label
        </button>
      </div>
    </div>
  );
}

function EditorView({
  kind,
  title,
  color,
  setTitle,
  setColor,
  onBack,
  onClose,
  onSubmit,
  onDeleteClick,
}: {
  kind: "Create label" | "Edit label";
  title: string;
  color: string | null;
  setTitle: (v: string) => void;
  setColor: (v: string | null) => void;
  onBack: () => void;
  onClose: () => void;
  onSubmit: () => void;
  onDeleteClick?: () => void; // samo u Edit modu
}) {
  return (
    <div className="flex min-h-0 flex-col p-3">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          type="button"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold text-zinc-800">{kind}</div>
        <button
          onClick={onClose}
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          type="button"
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* content (scroll on overflow) */}
      <div className="min-h-0 flex-1 overflow-auto pr-1">
        {/* preview */}
        <div className="mb-3 rounded-md bg-zinc-100 p-3">
          <div className="h-10 w-full rounded-md" style={{ backgroundColor: color ?? "#9CA3AF" }} />
        </div>

        <div className="mb-2 text-sm font-medium text-zinc-700">Title</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="Label title"
          className="mb-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
        />

        <div className="mb-2 text-sm font-medium text-zinc-700">Select a color</div>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((c) => {
            const active = color === c;
            return (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={["relative h-9 rounded-md border cursor-pointer", active ? "ring-2 ring-cyan-500 border-transparent" : "border-zinc-300"].join(" ")}
                style={{ backgroundColor: c }}
                type="button"
                title="Pick color"
              >
                {active && <Check className="absolute right-1 top-1 h-4 w-4 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setColor(null)}
          className="mt-3 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
          type="button"
          title="Remove color"
        >
          Remove color
        </button>
      </div>

      {/* footer */}
      <div className="mt-3 flex items-center justify-between">
        {onDeleteClick ? (
          <button
            onClick={onDeleteClick}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 cursor-pointer"
            type="button"
            title="Delete label"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : <span />}

        <button
          onClick={onSubmit}
          className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 cursor-pointer"
          type="button"
          title="Save"
        >
          {kind === "Create label" ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

function ConfirmDeleteView({
  onBack,
  onClose,
  onConfirm,
}: {
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col p-3">
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          type="button"
          aria-label="Back"
          title="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold text-zinc-800">Delete label</div>
        <button
          onClick={onClose}
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          type="button"
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-auto pr-1">
        <div className="rounded-md bg-zinc-100 p-3 text-sm text-zinc-700">
          <p>This will remove this label from all cards.</p>
          <p>There is no undo.</p>
        </div>
      </div>

      {/* footer */}
      <div className="mt-3">
        <button
          onClick={onConfirm}
          className="w-full rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 cursor-pointer"
          type="button"
          title="Delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
