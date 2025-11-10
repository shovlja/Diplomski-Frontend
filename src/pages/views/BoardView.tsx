import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TOKENS } from "@/lib/tokens";
import ListColumn from "@/components/ui/board/ListColumn";
import CardDialog from "@/components/ui/board/CardDialog";
import type { Checklist, Member, Card } from "@/features/boards/board";

/* ---------------- Local types used in BoardView (extension) -------------- */
export type CommentItem = { id: string; author: string; createdAt: string; text: string };

export type UCard = Card & {
  checklists?: Checklist[];
  dueComplete?: boolean;
  members?: Member[];
  comments?: CommentItem[];
};

type List = { id: number; title: string; position: number; cards: UCard[] };
type BoardState = { id: number; title: string; lists: List[] };

const BOARD_HEADER_H = 56;
const SCROLLBAR_SAFE_OFFSET = 8;
const nextPos = (len: number) => (len + 1) * 65535;

export default function BoardView() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [listDragging, setListDragging] = React.useState<number | null>(null); // id liste koja se vuče
  const [listOverIndex, setListOverIndex] = React.useState<number | null>(null); // gde će da padne
  const listsWrapRef = React.useRef<HTMLDivElement>(null);

  // Card dialog
  const [active, setActive] = React.useState<{ listId: number; listTitle: string; card: UCard } | null>(null);

  React.useEffect(() => {
    setBoard({
      id: Number(id ?? 1),
      title: "My Board",
      lists: [
        {
          id: 1,
          title: "To Do",
          position: 65535,
          cards: [
            {
              id: 101,
              title: "US-001: User Login",
              position: 65535,
              labels: [],
              checklists: [],
              dueDate: null,
              comments: [],
            },
            {
              id: 102,
              title: "US-003: Logout & Session",
              position: 65535 * 2,
              labels: [],
              checklists: [],
              dueDate: null,
              comments: [],
            },
          ],
        },
        { id: 2, title: "Doing", position: 65535 * 2, cards: [] },
        { id: 3, title: "Done", position: 65535 * 3, cards: [] },
      ],
    });
  }, [id]);

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

  function createList() {
    if (!board) return;
    const t = listTitle.trim();
    if (!t) return;
    const nl: List = { id: Math.floor(Math.random() * 1e9), title: t, position: nextPos(board.lists.length), cards: [] };
    setBoard({ ...board, lists: [...board.lists, nl] });
    setListTitle("");
    setAddingList(false);
  }

  function renameList(listId: number, next: string) {
    setBoard((b) => (b ? { ...b, lists: b.lists.map((l) => (l.id === listId ? { ...l, title: next } : l)) } : b));
  }

  function deleteList(listId: number) {
    setBoard((b) => (b ? { ...b, lists: b.lists.filter((l) => l.id !== listId) } : b));
  }

  function createCard(listId: number, title: string) {
    const trimmed = title.trim();
    if (!board || !trimmed) return;
    setBoard({
      ...board,
      lists: board.lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              cards: [
                ...l.cards,
                {
                  id: Math.floor(Math.random() * 1e9),
                  title: trimmed,
                  position: nextPos(l.cards.length),
                  labels: [],
                  dueDate: null,
                  checklists: [],
                  comments: [],
                },
              ],
            }
          : l
      ),
    });
  }

  // --------------------- DnD: CARDS ---------------------
  function onDragStart(cardId: number, fromListId: number, e?: React.DragEvent<HTMLDivElement>) {
    try {
      e?.dataTransfer?.setData("text/plain", String(cardId));
      if (e?.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
      }
    } catch { /* no-op */ }

    if (e?.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      setDragCardH(Math.max(44, Math.round(r.height)));
    } else {
      setDragCardH(56);
    }

    setDragging({ cardId, fromListId });
    setOver({ listId: null, index: null });
  }

  // blagi horizontalni auto-scroll dok vučeš
  function autoScrollHoriz(e: React.DragEvent) {
    const sc = scrollRef.current;
    if (!sc) return;
    const rect = sc.getBoundingClientRect();
    const x = e.clientX;
    const edge = 48; // px zona uz ivice
    const speed = 28; // px po onDragOver tick-u

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

  function commitDrop() {
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

    // remove from source
    const src = listsCopy.find((l) => l.id === fromListId)!;
    src.cards.splice(movingIdx, 1);

    // ako je ista lista i pomeraš nadole, pomeri targetIndex za -1
    if (fromListId === targetListId && movingIdx < targetIndex) targetIndex = Math.max(0, targetIndex - 1);

    // insert into target
    const dst = listsCopy.find((l) => l.id === targetListId)!;
    const clampedIndex = Math.min(Math.max(targetIndex, 0), dst.cards.length);
    dst.cards.splice(clampedIndex, 0, moving);

    // re-position
    for (const l of listsCopy) {
      l.cards = l.cards.map((c, i) => ({ ...c, position: (i + 1) * 65535 }));
    }

    setBoard({ ...board, lists: listsCopy });
    setDragging(null);
    setOver({ listId: null, index: null });
  }

  function onDrop() {
    commitDrop(); // koristi poslednji over
  }

  function onDragCancel() {
    setDragging(null);
    setOver({ listId: null, index: null });
  }

  // --------------------- DnD: LISTS ---------------------
  function onListDragStart(listId: number, e?: React.DragEvent) {
    try {
      e?.dataTransfer?.setData("text/plain", String(listId));
      if (e?.dataTransfer) e.dataTransfer.effectAllowed = "move";
    } catch { /* no-op */ }
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

  function commitListDrop() {
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
  }

  function onListsDrop() { commitListDrop(); }
  function onListsDragEnd() {
    setListDragging(null);
    setListOverIndex(null);
  }
  // -----------------------------------------------------------

  function openCard(listId: number, card: UCard) {
    const list = board?.lists.find((l) => l.id === listId);
    if (!list) return;
    setActive({ listId, listTitle: list.title, card });
  }
  function closeCard() {
    setActive(null);
  }

  // granular saves iz dijaloga
  function patchCard(listId: number, cardId: number, patch: Partial<UCard>) {
    setBoard((b) =>
      b
        ? {
            ...b,
            lists: b.lists.map((l) =>
              l.id === listId ? { ...l, cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) } : l
            ),
          }
        : b
    );
  }

  if (!board) return null;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${TOKENS.accent} 0%, #0f2e33 65%, #1b1b1b 100%)` }}
      onDragEnd={commitDrop} // fallback ako drop event ne pogodi container (za kartice)
    >
      {/* header */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 border-b border-white/20 bg-white/25 px-4 py-3 backdrop-blur"
        style={{ height: BOARD_HEADER_H }}
      >
        <h1 className="mx-auto text-base sm:text-lg font-semibold text-zinc-900">{board.title}</h1>
        <div className="ml-auto">
          <Button onClick={() => navigate(-1)} className="cursor-pointer">
            Back
          </Button>
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
                    onRename={(next) => renameList(list.id, next)}
                    onDelete={() => deleteList(list.id)}
                    onCreateCard={(title) => createCard(list.id, title)}
                    // DnD (cards)
                    onDragStart={(cardId: number, e: React.DragEvent<HTMLDivElement>) => onDragStart(cardId, list.id, e)}
                    onDragOver={(e) => onDragOverList(list.id, e)}
                    onDrop={onDrop}
                    onDropCancel={onDragCancel}
                    overIndex={over.listId === list.id ? over.index : null}
                    dragging={dragging}
                    dropHeight={dragCardH}
                    onOpenCard={(card) => openCard(list.id, card)}
                    // DnD (lists) – očekuješ da ListColumn ima handle i prosleđujemo mu start
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
                <Button onClick={createList} disabled={!listTitle.trim()} className="cursor-pointer">
                  Add list
                </Button>
                <Button variant="ghost" onClick={() => setAddingList(false)} className="cursor-pointer">
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* dialog */}
      {active && (
        <CardDialog
          open
          listTitle={active.listTitle}
          card={active.card}
          onClose={closeCard}
          onSaveTitle={(t) => patchCard(active.listId, active.card.id, { title: t })}
          onSaveDescription={(d) => patchCard(active.listId, active.card.id, { description: d })}
          onSaveLabels={(labels) => patchCard(active.listId, active.card.id, { labels })}
          onSaveDates={({ dueDate, dueComplete }) => patchCard(active.listId, active.card.id, { dueDate, dueComplete })}
          onSaveChecklists={(chk) => patchCard(active.listId, active.card.id, { checklists: chk })}
          onSaveMembers={(m) => patchCard(active.listId, active.card.id, { members: m })}
          onSaveComments={(cs) => patchCard(active.listId, active.card.id, { comments: cs })}
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
