import * as React from "react";
import CardItem from "./CardItem";
import Input from "@/components/ui/Input";
import { MoreHorizontal, Plus, GripVertical } from "lucide-react";
import ListActionsMenu from "./ListActionsMenu";
import type { Card as BaseCard, Checklist, Member } from "@/features/boards/board";

type UCard = BaseCard & {
  checklists?: Checklist[];
  checklist?: { id: string; title: string; items: { id: string; text: string; done: boolean }[] };
  members?: Member[];
  dueComplete?: boolean;
  comments?: { id: string; author: string; createdAt: string; text: string }[];
};

type List = { id: number; title: string; position: number; cards: UCard[] };

type Props = {
  list: List;
  onRename: (next: string) => void;
  onDelete: () => void;
  onCreateCard: (title: string) => void;

  // DnD (cards)
  onDragStart: (cardId: number, e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onDropCancel: () => void;
  overIndex: number | null;
  dragging: { cardId: number; fromListId: number } | null;

  onOpenCard: (card: UCard) => void;

  // visina phantom placeholder-a (dolazi iz BoardView merenja)
  dropHeight?: number;

  // DnD (lists)
  onListDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  isListGhost?: boolean;
};

export default function ListColumn({
  list,
  onRename,
  onDelete,
  onCreateCard,
  onDragStart,
  onDragOver,
  onDrop,
  onDropCancel,
  overIndex,
  dragging,
  onOpenCard,
  dropHeight = 56,
  onListDragStart,
  isListGhost = false,
}: Props) {
  const [adding, setAdding] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const addRef = React.useRef<HTMLDivElement>(null);

  // list actions menu
  const [menuOpen, setMenuOpen] = React.useState(false);
  const moreBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!adding) return;
    const onDoc = (e: MouseEvent) => {
      if (!addRef.current) return;
      if (!addRef.current.contains(e.target as Node)) setAdding(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [adding]);

  return (
    <div
      className={[
        "min-w-[300px] max-w-[360px] rounded-xl bg-white/80 p-3 shadow-sm backdrop-blur transition-opacity",
        isListGhost ? "opacity-40" : "",
      ].join(" ")}
      // dozvoli drop iznad cele liste (radi i za prazne)
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e as unknown as React.DragEvent<HTMLDivElement>);
      }}
      onDrop={onDrop}
    >
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* DRAG HANDLE ZA LISTU */}
          <div
            draggable
            onDragStart={onListDragStart}
            title="Drag list"
            aria-label="Drag list"
            role="button"
            className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <input
            value={list.title}
            onChange={(e) => onRename(e.currentTarget.value)}
            className="w-[72%] rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-zinc-800 outline-none hover:border-zinc-200 focus:border-cyan-500"
          />
        </div>

        <button
          ref={moreBtnRef}
          className="inline-grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
          title="List actions"
          type="button"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>

        {/* List actions menu */}
        <ListActionsMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorRef={moreBtnRef}
          onAddCard={() => {
            setMenuOpen(false);
            setAdding(true);
          }}
          onCopyList={() => { /* TODO */ }}
          onMoveList={() => { /* TODO */ }}
          onMoveAllCards={() => { /* TODO */ }}
          onWatch={() => { /* TODO */ }}
          onArchiveList={() => {
            setMenuOpen(false);
            onDelete();
          }}
          onArchiveAllCards={() => { /* TODO */ }}
        />
      </div>

      {/* cards area (droppable) */}
      <div
        className="space-y-2"
        data-cards
        onDragEnter={onDragOver}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(e);
        }}
        onDrop={onDrop}
      >
        {list.cards.map((c, idx) => {
          const isOverHere = overIndex != null && overIndex === idx;
          const isDragging = dragging?.cardId === c.id;

        return (
            <React.Fragment key={c.id}>
              {isOverHere && <DropHere height={dropHeight} />}
              <CardItem
                card={c}
                isGhost={!!isDragging}
                onOpen={() => onOpenCard(c)}
                onDragStart={(e) => onDragStart(c.id, e)}
                onDragEnd={onDropCancel}
              />
            </React.Fragment>
          );
        })}
        {overIndex != null && overIndex === list.cards.length && <DropHere height={dropHeight} />}
      </div>

      {/* Add card */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 inline-flex w-full cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add a card
        </button>
      ) : (
        <div ref={addRef} className="mt-2 space-y-2">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title…"
            rounded="lg"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const t = title.trim();
                if (!t) return;
                onCreateCard(t);
                setTitle("");
                setAdding(false);
              }}
              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 cursor-pointer"
              type="button"
            >
              Add card
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropHere({ height = 56 }: { height?: number }) {
  return (
    <div
      className="grid place-items-center rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-50/70 text-sm font-medium text-cyan-700 select-none transition-all"
      style={{ height: Math.max(44, height), minHeight: Math.max(44, height) }}
    >
      Drag here
    </div>
  );
}
