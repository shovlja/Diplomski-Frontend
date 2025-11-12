import * as React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TOKENS } from "@/lib/tokens";
import ListColumn from "@/components/ui/board/ListColumn";
import CardDialog from "@/components/ui/board/CardDialog";
import type { Checklist, Member, Card as BaseCard, LabelItem } from "@/features/boards/board";
import {
  getBoard, getBoardLabels,
  createList as apiCreateList,
  updateList as apiUpdateList,
  deleteList as apiDeleteList,
  createCard as apiCreateCard,
  updateCard as apiUpdateCard,
  reorderCards as apiReorderCards,
  reorderLists as apiReorderLists,
  setCardLabels as apiSetCardLabels,
  setCardMembers as apiSetCardMembers,
  replaceCardComments as apiReplaceCardComments,
  createLabel as apiCreateBoardLabel,
  type CardPatch,
  type ViewCard,
  type ViewList,
  type BoardPayload,
} from "@/features/boards/api";

/* ---------------- Local types used in BoardView (extension) -------------- */
export type CommentItem = { id: string; author: string; createdAt: string; text: string };

export type UCard = BaseCard & {
  checklists?: Checklist[];
  dueComplete?: boolean;
  members?: Member[];
  comments?: CommentItem[];
  /** computed flag samo za UI (100% checklist done) */
  __allChecklistDone?: boolean;
};

type List = { id: number; title: string; position: number; cards: UCard[] };
type BoardState = { id: number; title: string; lists: List[]; teamId?: number | null };

const BOARD_HEADER_H = 56;
const SCROLLBAR_SAFE_OFFSET = 8;

/* ——— helpers ——— */
type HasChecklists = { checklists?: Checklist[] };
function isAllChecklistDone(obj: HasChecklists): boolean {
  const lists = obj.checklists ?? [];
  if (!lists.length) return false;
  let total = 0, done = 0;
  for (const cl of lists) {
    total += cl.items.length;
    done += cl.items.filter((i) => i.done).length;
  }
  return total > 0 && total === done;
}
function toUCard(vc: ViewCard): UCard {
  return { ...vc, __allChecklistDone: isAllChecklistDone(vc) };
}

export default function BoardView() {
  const params = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  // dozvoli i /boards/:id i ?id=...
  const boardId = React.useMemo(() => {
    const raw = params.id ?? search.get("id") ?? "";
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.id, search]);

  const [board, setBoard] = React.useState<BoardState | null>(null);

  
  const [addingList, setAddingList] = React.useState(false);
  const [listTitle, setListTitle] = React.useState("");
  const addListRef = React.useRef<HTMLDivElement>(null);

  // DnD (cards)
  const [dragging, setDragging] = React.useState<{ cardId: number; fromListId: number } | null>(null);
  const [over, setOver] = React.useState<{ listId: number | null; index: number | null }>({ listId: null, index: null });
  const [dragCardH, setDragCardH] = React.useState<number>(56);

  // scroll container ref (za horizontalni auto-scroll)
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // DnD (lists)
  const [listDragging, setListDragging] = React.useState<number | null>(null);
  const [listOverIndex, setListOverIndex] = React.useState<number | null>(null);
  const listsWrapRef = React.useRef<HTMLDivElement>(null);

  // Card dialog
  const [active, setActive] = React.useState<{ listId: number; listTitle: string; card: UCard } | null>(null);

  // initial fetch
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!boardId) return;
      try {
        const data: BoardPayload = await getBoard(boardId);
        if (!alive) return;

        const mappedLists: List[] = (data.lists as ViewList[]).map((l) => ({
          ...l,
          cards: (l.cards ?? []).map(toUCard),
        }));
        setBoard({ id: data.id, title: data.title, lists: mappedLists, teamId: data.teamId ?? null });
      } catch (e) {
        console.error("getBoard failed", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [boardId]);

  const [labelsCatalog, setLabelsCatalog] = React.useState<LabelItem[]>([]);
  React.useEffect(() => {
    (async () => {
      if (!boardId) {
        setLabelsCatalog([]);
        return;
      }
      try {
        const rows = await getBoardLabels(boardId);
        setLabelsCatalog(rows ?? []);
      } catch (e) {
        console.error("getBoardLabels failed", e);
      }
    })();
  }, [boardId]);

  // lock page scroll
  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflowY;
    const prevBody = body.style.overflowY;
    html.style.overflowY = "hidden";
    body.style.overflowY = "hidden";
    return () => {
      html.style.overflowY = prevHtml;
      body.style.overflowY = prevBody;
    };
  }, []);

  // close "Add list" by outside click
  React.useEffect(() => {
    if (!addingList) return;
    const onDoc = (e: MouseEvent) => {
      if (!addListRef.current) return;
      if (!addListRef.current.contains(e.target as Node)) setAddingList(false);
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [addingList]);

  async function createList() {
    if (!board || !boardId) return;
    const t = listTitle.trim();
    if (!t) return;
    try {
      const created: ViewList = await apiCreateList(boardId, t);
      setBoard({
        ...board,
        lists: [
          ...board.lists,
          { ...created, cards: (created.cards ?? []).map(toUCard) },
        ],
      });
      setListTitle("");
      setAddingList(false);
    } catch (e) {
      console.error("createList failed", e);
    }
  }

  async function renameList(listId: number, next: string) {
    setBoard((b) => (b ? { ...b, lists: b.lists.map((l) => (l.id === listId ? { ...l, title: next } : l)) } : b));
    try {
      await apiUpdateList(listId, { title: next });
    } catch (e) {
      console.error("updateList title failed", e);
    }
  }

  async function deleteList(listId: number) {
    const prev = board;
    setBoard((b) => (b ? { ...b, lists: b.lists.filter((l) => l.id !== listId) } : b));
    try {
      await apiDeleteList(listId);
    } catch (e) {
      console.error("deleteList failed", e);
      if (prev) setBoard(prev);
    }
  }

  async function createCard(listId: number, title: string) {
    const trimmed = title.trim();
    if (!board || !trimmed) return;
    try {
      const created: ViewCard = await apiCreateCard(listId, trimmed);
      const createdWithComputed: UCard = toUCard(created);
      setBoard({
        ...board,
        lists: board.lists.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, createdWithComputed] } : l)),
      });
    } catch (e) {
      console.error("createCard failed", e);
    }
  }

  /* --------------------- DnD: CARDS --------------------- */
  function onDragStart(cardId: number, fromListId: number, e?: React.DragEvent<HTMLDivElement>) {
    try {
      e?.dataTransfer?.setData("text/plain", String(cardId));
      if (e?.dataTransfer) e.dataTransfer.effectAllowed = "move";
    } catch {
      /* ignore */
    }

    if (e?.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      setDragCardH(Math.max(44, Math.round(r.height)));
    } else {
      setDragCardH(56);
    }

    setDragging({ cardId, fromListId });
    setOver({ listId: null, index: null });
  }

  function autoScrollHoriz(e: React.DragEvent) {
    const sc = scrollRef.current;
    if (!sc) return;
    const rect = sc.getBoundingClientRect();
    const x = e.clientX;
    const edge = 48;
    const speed = 28;

    if (x - rect.left < edge) sc.scrollLeft -= speed;
    else if (rect.right - x < edge) sc.scrollLeft += speed;
  }

  function onDragOverList(listId: number, e: React.DragEvent<HTMLDivElement>) {
    if (!board || !dragging) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    autoScrollHoriz(e);

    const container = e.currentTarget as HTMLDivElement;
    const children = Array.from(container.querySelectorAll<HTMLDivElement>("[data-card-item]"));
    const pointerY = e.clientY;

    let targetIndex = children.length;
    for (let i = 0; i < children.length; i++) {
      const r = children[i].getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (pointerY < mid) { targetIndex = i; break; }
    }
    setOver({ listId, index: targetIndex });
  }

  async function commitDrop() {
    if (!board || !dragging || over.listId == null || over.index == null) {
      setDragging(null);
      setOver({ listId: null, index: null });
      return;
    }

    const { cardId, fromListId } = dragging;
    const targetListId = over.listId;
    let targetIndex = over.index;

    const srcList = board.lists.find((l) => l.id === fromListId);
    const dstList = board.lists.find((l) => l.id === targetListId);
    if (!srcList || !dstList) {
      setDragging(null);
      setOver({ listId: null, index: null });
      return;
    }

    const movingIdx = srcList.cards.findIndex((c) => c.id === cardId);
    if (movingIdx < 0) {
      setDragging(null);
      setOver({ listId: null, index: null });
      return;
    }
    const moving = srcList.cards[movingIdx];

    const listsCopy = board.lists.map((l) => ({ ...l, cards: [...l.cards] }));

    const src = listsCopy.find((l) => l.id === fromListId)!;
    src.cards.splice(movingIdx, 1);

    if (fromListId === targetListId && movingIdx < targetIndex) targetIndex = Math.max(0, targetIndex - 1);

    const dst = listsCopy.find((l) => l.id === targetListId)!;
    const clampedIndex = Math.min(Math.max(targetIndex, 0), dst.cards.length);
    dst.cards.splice(clampedIndex, 0, moving);

    for (const l of listsCopy) {
      l.cards = l.cards.map((c, i) => ({ ...c, position: (i + 1) * 65535 }));
    }

    setBoard({ ...board, lists: listsCopy });
    setDragging(null);
    setOver({ listId: null, index: null });

    try {
      const srcIds = (listsCopy.find((l) => l.id === fromListId)?.cards ?? []).map((c) => c.id);
      const dstIds = fromListId === targetListId ? srcIds : (listsCopy.find((l) => l.id === targetListId)?.cards ?? []).map((c) => c.id);

      if (fromListId === targetListId) {
        await apiReorderCards(targetListId, srcIds);
      } else {
        await Promise.all([
          apiReorderCards(fromListId, srcIds),
          apiReorderCards(targetListId, dstIds),
        ]);
      }
    } catch (e) {
      console.error("reorderCards failed", e);
    }
  }

  function onDrop() { void commitDrop(); }
  function onDragCancel() { setDragging(null); setOver({ listId: null, index: null }); }

  /* --------------------- DnD: LISTS --------------------- */
  function onListDragStart(listId: number, e?: React.DragEvent) {
    try {
      e?.dataTransfer?.setData("text/plain", String(listId));
      if (e?.dataTransfer) e.dataTransfer.effectAllowed = "move";
    } catch {
      /* ignore */
    }
    setListDragging(listId);
    setListOverIndex(null);
  }

  function onListsDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!board || listDragging == null) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    autoScrollHoriz(e);

    const cont = listsWrapRef.current;
    if (!cont) return;

    const cols = Array.from(cont.querySelectorAll<HTMLDivElement>("[data-list-col]"));
    const pointerX = e.clientX;

    let target = cols.length;
    for (let i = 0; i < cols.length; i++) {
      const r = cols[i].getBoundingClientRect();
      const mid = r.left + r.width / 2;
      if (pointerX < mid) { target = i; break; }
    }
    setListOverIndex(target);
  }

  async function commitListDrop() {
    if (!board || listDragging == null || listOverIndex == null) {
      setListDragging(null);
      setListOverIndex(null);
      return;
    }

    const fromIdx = board.lists.findIndex((l) => l.id === listDragging);
    if (fromIdx < 0) {
      setListDragging(null);
      setListOverIndex(null);
      return;
    }

    let targetIndex = listOverIndex;
    const listsCopy = [...board.lists];
    const [moving] = listsCopy.splice(fromIdx, 1);

    if (fromIdx < targetIndex) targetIndex = Math.max(0, targetIndex - 1);
    const clamped = Math.min(Math.max(targetIndex, 0), listsCopy.length);
    listsCopy.splice(clamped, 0, moving);

    const rePos = listsCopy.map((l, i) => ({ ...l, position: (i + 1) * 65535 }));
    setBoard({ ...board, lists: rePos });

    setListDragging(null);
    setListOverIndex(null);

    try {
      await apiReorderLists(board.id, rePos.map((l) => l.id));
    } catch (e) {
      console.error("reorderLists failed", e);
    }
  }

  function onListsDrop() { void commitListDrop(); }
  function onListsDragEnd() { setListDragging(null); setListOverIndex(null); }

  function openCard(listId: number, card: UCard) {
    const list = board?.lists.find((l) => l.id === listId);
    if (!list) return;
    setActive({ listId, listTitle: list.title, card });
  }
  function closeCard() { setActive(null); }

  async function patchCard(listId: number, cardId: number, patch: Partial<UCard>) {
    setBoard((b) =>
      b
        ? {
            ...b,
            lists: b.lists.map((l) =>
              l.id === listId
                ? {
                    ...l,
                    cards: l.cards.map((c) => {
                      if (c.id !== cardId) return c;
                      const next: UCard = { ...c, ...patch };
                      next.__allChecklistDone = isAllChecklistDone(next);
                      return next;
                    }),
                  }
                : l
            ),
          }
        : b
    );

    const persist: CardPatch = {};
    if ("title" in patch) persist.title = patch.title;
    if ("description" in patch) persist.description = patch.description;
    if ("dueDate" in patch) persist.dueDate = patch.dueDate ?? null;
    if ("dueComplete" in patch) persist.dueComplete = patch.dueComplete;

    if (Object.keys(persist).length === 0) return;
    try { await apiUpdateCard(cardId, persist); } catch (e) { console.error("updateCard failed", e); }
  }

  /** Kreiraj manjkajuće board labele pre dodele na karticu */
  async function saveCardLabels(listId: number, cardId: number, labels: LabelItem[]) {
    if (!board) return;

    const ensuredIds: number[] = [];
    const ensuredLabels: LabelItem[] = [];

    for (const l of labels) {
      if (l.id > 0) {
        ensuredIds.push(l.id);
        ensuredLabels.push(l);
        continue;
      }
      try {
        const created = await apiCreateBoardLabel(board.id, { name: l.name, color: l.color });
        ensuredIds.push(created.id);
        ensuredLabels.push({ ...l, id: created.id });
      } catch (e) {
        console.error("createLabel for board failed", e);
      }
    }

    await patchCard(listId, cardId, { labels: ensuredLabels });

    try {
      await apiSetCardLabels(cardId, ensuredIds);
    } catch (e) {
      console.error("setCardLabels failed", e);
    }
  }

  async function saveCardMembers(listId: number, cardId: number, m: Member[]) {
    await patchCard(listId, cardId, { members: m });
    try { await apiSetCardMembers(cardId, m.map((x) => x.id)); } catch (e) { console.error("setCardMembers failed", e); }
  }

  async function saveCardComments(listId: number, cardId: number, cs: CommentItem[]) {
    await patchCard(listId, cardId, { comments: cs });
    try { await apiReplaceCardComments(cardId, cs); } catch (e) { console.error("replaceCardComments failed", e); }
  }

  if (!boardId) {
    return (
      <div className="p-6 text-sm text-zinc-700">
        Missing <code>id</code> – open as <code>/boards/123</code> ili <code>?id=123</code>.
      </div>
    );
  }
  if (!board) return null;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${TOKENS.accent} 0%, #0f2e33 65%, #1b1b1b 100%)` }}
      onDragEnd={commitDrop}
    >
      {/* header */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-white/20 bg-white/25 px-4 py-3 backdrop-blur"
        style={{ height: BOARD_HEADER_H }}
      >
        <h1 className="mx-auto text-base sm:text-lg font-semibold text-zinc-900">{board.title}</h1>
        <div className="ml-auto">
          <Button onClick={() => navigate(-1)} className="cursor-pointer">Back</Button>
        </div>
      </div>

      {/* lists */}
      <div
        ref={scrollRef}
        className="board-scroll absolute inset-x-0 overflow-x-auto overflow-y-hidden"
        style={{ top: BOARD_HEADER_H, bottom: SCROLLBAR_SAFE_OFFSET }}
      >
        <div
          ref={listsWrapRef}
          className="flex w-max items-start gap-4 px-4 pb-6 pt-4"
          onDragOver={onListsDragOver}
          onDrop={onListsDrop}
          onDragLeave={(e) => {
            const rel = e.relatedTarget as Node | null;
            if (!e.currentTarget.contains(rel)) onListsDragEnd();
          }}
        >
          {board.lists
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((list, idx, arr) => (
              <React.Fragment key={list.id}>
                {listDragging != null && listOverIndex === idx && <ListPlaceholder />}
                <div data-list-col>
                  <ListColumn
                    key={list.id}
                    list={list}
                    onRename={(next) => void renameList(list.id, next)}
                    onDelete={() => void deleteList(list.id)}
                    onCreateCard={(title) => void createCard(list.id, title)}
                    onDragStart={(cardId: number, e: React.DragEvent<HTMLDivElement>) => onDragStart(cardId, list.id, e)}
                    onDragOver={(e) => onDragOverList(list.id, e)}
                    onDrop={onDrop}
                    onDropCancel={onDragCancel}
                    overIndex={over.listId === list.id ? over.index : null}
                    dragging={dragging}
                    dropHeight={dragCardH}
                    onOpenCard={(card) => openCard(list.id, card)}
                    onListDragStart={(e) => onListDragStart(list.id, e)}
                    isListGhost={listDragging === list.id}
                  />
                </div>
                {idx === arr.length - 1 && listDragging != null && listOverIndex === arr.length && <ListPlaceholder />}
              </React.Fragment>
            ))}

          {!addingList ? (
            <button
              onClick={() => setAddingList(true)}
              className="min-w-[300px] cursor-pointer rounded-xl border border-white/50 bg-white/50 px-4 py-3 text-left text-[15px] text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white/60"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add another list
              </span>
            </button>
          ) : (
            <div ref={addListRef} className="min-w-[300px] rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Input autoFocus value={listTitle} onChange={(e) => setListTitle(e.target.value)} placeholder="Enter list name…" rounded="lg" className="mb-2" />
              <div className="flex items-center gap-2">
                <Button onClick={createList} disabled={!listTitle.trim()} className="cursor-pointer">Add list</Button>
                <Button variant="ghost" onClick={() => setAddingList(false)} className="cursor-pointer">✕</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* dialog */}
      {active && (
        <CardDialog
          open
          boardId={board.id}
          boardTeamId={board.teamId ?? undefined}
          listTitle={active.listTitle}
          card={active.card}
          onClose={closeCard}
          labelsCatalog={labelsCatalog}
          onLabelsCatalogChange={setLabelsCatalog}
          onSaveTitle={(t) => void patchCard(active.listId, active.card.id, { title: t })}
          onSaveDescription={(d) => void patchCard(active.listId, active.card.id, { description: d })}
          onSaveLabels={(labels) => void saveCardLabels(active.listId, active.card.id, labels)}
          onSaveDates={({ dueDate, dueComplete }) => void patchCard(active.listId, active.card.id, { dueDate, dueComplete })}
          onSaveChecklists={(chk) => void patchCard(active.listId, active.card.id, { checklists: chk })}
          onSaveMembers={(m) => void saveCardMembers(active.listId, active.card.id, m)}
          onSaveComments={(cs) => void saveCardComments(active.listId, active.card.id, cs)}
        />
      )}
    </div>
  );
}

/* ----------- UI: placeholder kolona tokom DnD lista ----------- */
function ListPlaceholder() {
  return (
    <div
      className="min-w-[300px] max-w-[360px] rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-50/70 p-3 text-sm font-medium text-cyan-700 grid place-items-center select-none"
      style={{ height: 120 }}
      aria-hidden
    >
      Drop list here
    </div>
  );
}
