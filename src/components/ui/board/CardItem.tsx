import * as React from "react";
import { Calendar as CalendarIcon, CheckSquare, MessageSquare } from "lucide-react";
import type { Card as BaseCard, Checklist, Member, LabelItem } from "@/features/boards/board";

/* local */
type CommentItem = { id: string; author: string; createdAt: string; text: string };

type UCard = BaseCard & {
  labels?: LabelItem[];
  checklists?: Checklist[];
  checklist?: { id: string; title: string; items: { id: string; text: string; done: boolean }[] };
  members?: Member[];
  comments?: CommentItem[];
  dueComplete?: boolean;
};

type Props = {
  card?: UCard;               // tolerisati undefined tokom re-rendera
  isGhost?: boolean;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
};

function fmtDate(d: Date) {
  const m = d.toLocaleString(undefined, { month: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m} ${day}, ${hh}:${mm}`;
}

export default function CardItem({ card, isGhost, onOpen, onDragStart, onDragEnd }: Props) {
  // Guard: ako je bio drag, ne otvaraj na click
  const draggingRef = React.useRef(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    onDragStart(e);
  };
  const handleDragEnd = () => {
    setTimeout(() => { draggingRef.current = false; }, 0);
    onDragEnd();
  };
  const handleClick = () => {
    if (draggingRef.current) return;
    onOpen();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!draggingRef.current) onOpen();
    }
  };

  // Hooks moraju uvek da se pozovu – bez early return-a
  const totals = React.useMemo(() => {
    if (!card) return { done: 0, total: 0 };
    const res = { done: 0, total: 0 };
    if (Array.isArray(card.checklists) && card.checklists.length) {
      for (const cl of card.checklists) {
        res.total += cl.items.length;
        res.done += cl.items.filter((i) => i.done).length;
      }
      return res;
    }
    if (card.checklist && Array.isArray(card.checklist.items)) {
      res.total = card.checklist.items.length;
      res.done = card.checklist.items.filter((i) => i.done).length;
    }
    return res;
  }, [card]);

  const due = React.useMemo(() => {
    if (!card?.dueDate) return null;
    return new Date(card.dueDate);
  }, [card]);

  // Tamniji due “pill” da se ne stapa sa tonom kartice
  const duePill = React.useMemo(() => {
    if (!due || card?.dueComplete) return { cls: "border-zinc-400 text-zinc-700", bg: "bg-zinc-100" };
    const h = (due.getTime() - Date.now()) / 3_600_000;
    if (h <= 8)  return { cls: "border-red-700 text-red-800",       bg: "bg-red-200" };
    if (h <= 24) return { cls: "border-yellow-700 text-yellow-800", bg: "bg-yellow-200" };
    return { cls: "border-zinc-400 text-zinc-700", bg: "bg-zinc-100" };
  }, [due, card?.dueComplete]);

  // Tamnije nijanse za celu karticu
  const tone = React.useMemo(() => {
    if (!due || card?.dueComplete) return { bg: "bg-white", border: "border-zinc-200" };
    const h = (due.getTime() - Date.now()) / 3_600_000;
    if (h <= 8)  return { bg: "bg-red-100",    border: "border-red-400" };
    if (h <= 24) return { bg: "bg-yellow-100", border: "border-yellow-400" };
    return { bg: "bg-white", border: "border-zinc-200" };
  }, [due, card?.dueComplete]);

  const commentsCount = card?.comments?.length ?? 0;
  const selectedLabels = (card?.labels ?? []).slice(0, 6);

  const initials = (full?: string) =>
    (full ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  return (
    <div
      data-card-item
      data-card-id={card?.id}
      role="button"
      tabIndex={0}
      draggable={!!card}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        "relative cursor-grab rounded-xl px-3 py-2 shadow-sm",
        "active:cursor-grabbing",
        "border",
        tone.border,
        tone.bg,
        isGhost ? "opacity-40" : "",
      ].join(" ")}
    >
      {/* gornje trakice (labels) */}
      {selectedLabels.length > 0 && (
        <div className="mb-1 flex items-center gap-1.5">
          {selectedLabels.map((l) => (
            <span key={l.id} className="h-1.5 w-6 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
          ))}
        </div>
      )}

      {/* naslov */}
      <div className="pr-14 text-[15px] font-medium text-zinc-800">{card?.title ?? "…"}</div>

      {/* članovi – gore desno */}
      {Array.isArray(card?.members) && card!.members!.length > 0 && (
        <div className="absolute right-2 top-2 flex -space-x-1">
          {card!.members!.slice(0, 3).map((m) => (
            <span
              key={m.id}
              className="grid h-6 w-6 place-items-center rounded-full bg-purple-600 text-[10px] font-semibold text-white"
              title={m.display_name ?? m.id}
            >
              {initials(m.display_name ?? m.id)}
            </span>
          ))}
        </div>
      )}

      {/* meta red */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {totals.total > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
            <CheckSquare className="h-3 w-3" />
            {totals.done}/{totals.total}
          </span>
        )}

        {due && (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5",
              duePill.bg, "border", duePill.cls, "ring-1 ring-black/5",
            ].join(" ")}
            title={due.toString()}
          >
            <CalendarIcon className="h-3 w-3" />
            {fmtDate(due)}
          </span>
        )}

        {commentsCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
            <MessageSquare className="h-3 w-3" />
            {commentsCount}
          </span>
        )}
      </div>
    </div>
  );
}
