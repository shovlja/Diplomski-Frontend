import * as React from "react";
import { createPortal } from "react-dom";
import { X, Tag, Calendar as CalendarIcon, CheckSquare, Users, Plus } from "lucide-react";
import LabelsPopover from "./LabelsPopover";
import DatesPopover, { type DatesResult } from "./DatesPopover";
import ChecklistPopover from "./ChecklistPopover";
import MembersPopover from "./MembersPopover";
import CardSection from "./CardSection";
import ProgressBar from "./ProgressBar";
import DueBadge from "./DueBadge";
import { Button } from "@/components/ui/Button";
import type { Checklist, LabelItem, Member } from "@/features/boards/board";

/* ----------------------------- Local types ----------------------------- */
export type CommentItem = { id: string; author: string; createdAt: string; text: string };

export type CardDialogCard = {
  id: number;
  title: string;
  description?: string;
  labels?: LabelItem[];
  dueDate?: string | null;
  dueComplete?: boolean;
  checklists?: Checklist[];
  members?: Member[];
  comments?: CommentItem[];
};

type Props = {
  open: boolean;
  card: CardDialogCard;
  listTitle: string;
  onClose: () => void;

  onSaveTitle?: (value: string) => void;
  onSaveDescription?: (value: string) => void;
  onSaveLabels?: (labels: LabelItem[]) => void;
  onSaveDates?: (data: { dueDate: string | null; dueComplete: boolean }) => void;
  onSaveChecklists?: (lists: Checklist[] | undefined) => void;
  onSaveMembers?: (members: Member[]) => void;
  onSaveComments?: (comments: CommentItem[]) => void;
};

const DEFAULT_LABELS: LabelItem[] = [
  { id: 1, name: "User Story", color: "#2FB26A", checked: false },
  { id: 2, name: "Database", color: "#FDB022", checked: false },
  { id: 3, name: "Frontend", color: "#F97066", checked: false },
  { id: 4, name: "Design", color: "#F63D68", checked: false },
  { id: 5, name: "Bug", color: "#12A89E", checked: false },
  { id: 6, name: "QA", color: "#7A5AF8", checked: false },
];

function mergeLabels(selected?: LabelItem[]) {
  const map = new Map<number, LabelItem>();
  for (const d of DEFAULT_LABELS) map.set(d.id, { ...d, checked: false });
  for (const s of selected ?? []) map.set(s.id, { ...s, checked: s.checked ?? true });
  return Array.from(map.values());
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const initials = (name: string) =>
  name.split(" ").map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("");

export default function CardDialog({
  open,
  card,
  listTitle,
  onClose,
  onSaveTitle,
  onSaveDescription,
  onSaveLabels,
  onSaveDates,
  onSaveChecklists,
  onSaveMembers,
  onSaveComments,
}: Props) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // state
  const [title, setTitle] = React.useState(card.title);
  const [labels, setLabels] = React.useState<LabelItem[]>(mergeLabels(card.labels));
  const [due, setDue] = React.useState<string | null>(card.dueDate ?? null);
  const [dueComplete, setDueComplete] = React.useState<boolean>(!!card.dueComplete);
  const [lists, setLists] = React.useState<Checklist[]>(Array.isArray(card.checklists) ? card.checklists : []);
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({});
  const [members, setMembers] = React.useState<Member[]>(card.members ?? []);

  const [desc, setDesc] = React.useState(card.description ?? "");
  const [descDraft, setDescDraft] = React.useState(card.description ?? "");
  const [editingDesc, setEditingDesc] = React.useState(false);

  const [comments, setComments] = React.useState<CommentItem[]>(card.comments ?? []);
  const [commentText, setCommentText] = React.useState("");

  // comment edit/delete
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [commentDraft, setCommentDraft] = React.useState("");
  const [delState, setDelState] = React.useState<{ id: string | null; anchor: HTMLElement | null }>({ id: null, anchor: null });

  // popover refs
  const labelsToolbarBtnRef = React.useRef<HTMLButtonElement>(null);
  const labelsPlusBtnRef = React.useRef<HTMLButtonElement>(null);
  const datesBtnRef = React.useRef<HTMLButtonElement>(null);
  const checklistBtnRef = React.useRef<HTMLButtonElement>(null);
  const membersBtnRef = React.useRef<HTMLButtonElement>(null);

  // koji element je trenutni anchor za Labels popover
  const [labelsAnchor, setLabelsAnchor] = React.useState<"toolbar" | "plus">("toolbar");

  const [labelsOpen, setLabelsOpen] = React.useState(false);
  const [datesOpen, setDatesOpen] = React.useState(false);
  const [checklistOpen, setChecklistOpen] = React.useState(false);
  const [membersOpen, setMembersOpen] = React.useState(false);

  // sync na promeni karte
  React.useEffect(() => {
    setTitle(card.title);
    setLabels(mergeLabels(card.labels));
    setDue(card.dueDate ?? null);
    setDueComplete(!!card.dueComplete);
    setLists(Array.isArray(card.checklists) ? card.checklists : []);
    setHidden({});
    setMembers(card.members ?? []);
    setDesc(card.description ?? "");
    setDescDraft(card.description ?? "");
    setEditingDesc(false);
    setComments(card.comments ?? []);
    setCommentText("");
    setEditingCommentId(null);
    setCommentDraft("");
    setDelState({ id: null, anchor: null });
  }, [card]);

  // zatvaranje klikom na overlay
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const ov = overlayRef.current;
      if (ov && e.target instanceof Node && e.target === ov) onClose();
    };
    document.addEventListener("mousedown", onDoc, true);
    return () => document.removeEventListener("mousedown", onDoc, true);
  }, [open, onClose]);

  if (!open) return null;

  const selectedLabels = labels.filter((l) => l.checked);

  const sums = lists.reduce(
    (acc, list) => {
      acc.total += list.items.length;
      acc.done += list.items.filter((i) => i.done).length;
      return acc;
    },
    { done: 0, total: 0 }
  );
  const pctAll = sums.total ? Math.round((sums.done / sums.total) * 100) : 0;

  function addComment() {
    const text = commentText.trim();
    if (!text) return;
    const c: CommentItem = { id: crypto.randomUUID(), author: "Petar Šovljanski", createdAt: new Date().toISOString(), text };
    const next = [c, ...comments];
    setComments(next);
    setCommentText("");
    onSaveComments?.(next);
  }

  function startEditComment(id: string, current: string) {
    setEditingCommentId(id);
    setCommentDraft(current);
  }

  function saveEditComment(id: string) {
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    const next = comments.map((c) => (c.id === id ? { ...c, text: trimmed } : c));
    setComments(next);
    setEditingCommentId(null);
    setCommentDraft("");
    onSaveComments?.(next);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setCommentDraft("");
  }

  function askDeleteComment(id: string, anchor: HTMLElement | null) {
    setDelState({ id, anchor });
  }

  function confirmDeleteComment() {
    if (!delState.id) return;
    const next = comments.filter((c) => c.id !== delState.id);
    setComments(next);
    setDelState({ id: null, anchor: null });
    onSaveComments?.(next);
  }

  // helper: izaberi stabilan anchor dok je popover otvoren (fallback na toolbar ako plus ne postoji)
  const labelsAnchorRef = (labelsAnchor === "plus" && labelsPlusBtnRef.current)
    ? labelsPlusBtnRef
    : labelsToolbarBtnRef;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/40 p-6" aria-modal="true" role="dialog">
      <div
        className="
          mx-auto mt-6 grid w-full max-w-5xl
          grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]
          grid-rows-[auto_minmax(0,1fr)]
          gap-6 rounded-2xl bg-white p-5 shadow-2xl
        "
        style={{ maxHeight: "80vh", overflow: "hidden" }}
      >
        {/* Header sa kratkim progress-om u pilu (centriran uz breadcrumb) */}
        <div className="lg:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500">
              {listTitle} <span className="mx-1">/</span> <span className="font-medium text-zinc-700">Card</span>
            </div>
            {sums.total > 0 && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                <div className="w-24"><ProgressBar value={pctAll} /></div>
                <span className="text-xs text-zinc-600">{pctAll}%</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 cursor-pointer"
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* LEFT */}
        <div className="min-h-0 overflow-y-auto pr-2 pb-6 space-y-5">
          {/* Naslov */}
          <input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onBlur={() => onSaveTitle?.(title)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[15px] font-semibold text-zinc-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton
              ref={labelsToolbarBtnRef}
              icon={<Tag className="h-4 w-4" />}
              label="Labels"
              onClick={() => { setLabelsAnchor("toolbar"); setLabelsOpen(true); }}
            />
            <ToolbarButton ref={datesBtnRef} icon={<CalendarIcon className="h-4 w-4" />} label="Dates" onClick={() => setDatesOpen(true)} />
            <ToolbarButton ref={checklistBtnRef} icon={<CheckSquare className="h-4 w-4" />} label="Checklist" onClick={() => setChecklistOpen(true)} />
            <ToolbarButton ref={membersBtnRef} icon={<Users className="h-4 w-4" />} label="Members" onClick={() => setMembersOpen(true)} />
          </div>

          {/* Labels + Due u istom redu; bez “Edit”, samo plusić */}
          {(selectedLabels.length > 0 || due) && (
            <CardSection title="Labels">
              <div className="flex flex-wrap items-center gap-2">
                {selectedLabels.map((l) => (
                  <span
                    key={l.id}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: l.color }}
                  >
                    {l.name}
                  </span>
                ))}

                {/* PLUS za labele – inline uz bedževe */}
                <button
                  ref={labelsPlusBtnRef}
                  onClick={() => { setLabelsAnchor("plus"); setLabelsOpen(true); }}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-300 px-2 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                  type="button"
                  aria-label="Add or remove labels"
                >
                  <Plus className="h-4 w-4" />
                </button>

                {due && (
                  <button
                    onClick={() => setDatesOpen(true)}
                    className="ml-2 inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                    type="button"
                    title="Change due date"
                  >
                    <DueBadge
                      value={due}
                      complete={dueComplete}
                      onToggleComplete={(next) => {
                        setDueComplete(next);
                        onSaveDates?.({ dueDate: due, dueComplete: next });
                      }}
                    />
                  </button>
                )}
              </div>
            </CardSection>
          )}

          {/* Description */}
          <CardSection
            title="Description"
            right={
              !editingDesc ? (
                <button
                  onClick={() => {
                    setEditingDesc(true);
                    setDescDraft(desc);
                  }}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                  type="button"
                >
                  Edit
                </button>
              ) : undefined
            }
          >
            {!editingDesc ? (
              desc.trim() ? (
                <div className="rounded-lg border border-transparent bg-transparent px-1 py-1 text-[15px] text-zinc-800 whitespace-pre-wrap">
                  {desc}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingDesc(true);
                    setDescDraft("");
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-[15px] text-zinc-500 hover:bg-zinc-50 cursor-pointer"
                  type="button"
                >
                  Add a more detailed description…
                </button>
              )
            ) : (
              <>
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.currentTarget.value)}
                  placeholder="Make your description even better. Type '/' to insert content, formatting, and more."
                  className="w-full h-40 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[15px] text-zinc-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setDesc(descDraft);
                      onSaveDescription?.(descDraft);
                      setEditingDesc(false);
                    }}
                    className="cursor-pointer"
                  >
                    Save
                  </Button>
                  <Button variant="ghost" onClick={() => { setDescDraft(desc); setEditingDesc(false); }} className="cursor-pointer">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardSection>

          {/* Više checklist-a */}
          {lists.map((cl) => {
            const done = cl.items.filter((i) => i.done).length;
            const total = cl.items.length;
            const pct = total ? (done / total) * 100 : 0;
            const hide = !!hidden[cl.id];

            return (
              <CardSection
                key={cl.id}
                title={cl.title}
                right={
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      onClick={() => setHidden((h) => ({ ...h, [cl.id]: !h[cl.id] }))}
                      type="button"
                    >
                      {hide ? "Show checked items" : "Hide checked items"}
                    </button>
                    <button
                      className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      onClick={() => {
                        const next = lists.filter((x) => x.id !== cl.id);
                        setLists(next);
                        onSaveChecklists?.(next.length ? next : undefined);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                }
              >
                <div className="mb-2 text-xs text-zinc-600">{Math.round(pct)}%</div>
                <ProgressBar value={pct} />
                <div className="mt-3 space-y-1">
                  {(hide ? cl.items.filter((i) => !i.done) : cl.items).map((it, i) => (
                    <label key={it.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={it.done}
                        onChange={(e) => {
                          const next = lists.map((l) =>
                            l.id === cl.id ? { ...l, items: l.items.map((x, ii) => (ii === i ? { ...x, done: e.currentTarget.checked } : x)) } : l
                          );
                          setLists(next);
                          onSaveChecklists?.(next);
                        }}
                      />
                      <span className={it.done ? "line-through text-zinc-400" : ""}>{it.text}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    placeholder="Add an item"
                    className="flex-1 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-cyan-500"
                    onKeyDown={(e) => {
                      const target = e.currentTarget as HTMLInputElement;
                      if (e.key === "Enter" && target.value.trim()) {
                        const next = lists.map((l) =>
                          l.id === cl.id ? { ...l, items: [...l.items, { id: crypto.randomUUID(), text: target.value.trim(), done: false }] } : l
                        );
                        setLists(next);
                        onSaveChecklists?.(next);
                        target.value = "";
                      }
                    }}
                  />
                </div>
              </CardSection>
            );
          })}
        </div>

        {/* RIGHT (comments & activity) */}
        <aside className="min-h-0 flex flex-col rounded-xl border border-zinc-200 bg-zinc-50">
          <div className="flex items-center justify-between px-3 pt-3">
            <div className="text-sm font-semibold text-zinc-700">Comments and activity</div>
          </div>

          <div className="px-3 pt-2">
            <div className="mb-2 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Write a comment…"
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
              <Button onClick={addComment} className="h-8 px-3 cursor-pointer">Post</Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 space-y-4">
            {comments.map((c) => {
              const isEditing = editingCommentId === c.id;
              return (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="mt-0.5 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7C3AED] text-[11px] font-semibold text-white">
                    {initials(c.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-zinc-800">{c.author}</div>
                      <span className="text-xs text-zinc-500">just now</span>
                    </div>

                    {/* Text ili editor */}
                    {!isEditing ? (
                      <div className="mt-0.5 text-sm text-zinc-800 whitespace-pre-wrap">{c.text}</div>
                    ) : (
                      <div className="mt-1">
                        <textarea
                          value={commentDraft}
                          onChange={(e) => setCommentDraft(e.currentTarget.value)}
                          className="w-full h-24 resize-none rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        />
                        <div className="mt-1 flex items-center gap-2">
                          <Button onClick={() => saveEditComment(c.id)} className="h-8 px-3 cursor-pointer">Save</Button>
                          <Button variant="ghost" onClick={cancelEditComment} className="h-8 px-3 cursor-pointer">Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* actions */}
                    {!isEditing && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                        <button
                          onClick={() => startEditComment(c.id, c.text)}
                          className="hover:underline text-zinc-700 cursor-pointer"
                          type="button"
                          title="Edit comment"
                        >
                          Edit
                        </button>
                        <span>•</span>
                        <button
                          ref={() => {
                            // just to keep ref available when needed
                            /* no-op: anchor is passed at click time */
                          }}
                          onClick={(e) => askDeleteComment(c.id, e.currentTarget as HTMLElement)}
                          className="hover:underline text-rose-600 cursor-pointer"
                          type="button"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div className="mt-0.5 text-[11px] text-zinc-500">{fmtDateTime(c.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Popovers */}
        <LabelsPopover
          open={labelsOpen}
          anchorRef={labelsAnchorRef}
          onClose={() => {
            setLabelsOpen(false);
            onSaveLabels?.(labels.filter((l) => l.checked));
          }}
          labels={labels}
          onToggle={(id) => setLabels((prev) => prev.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)))}
          onCreate={(lbl) => {
            setLabels((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              map.set(lbl.id, lbl);
              return Array.from(map.values());
            });
            onSaveLabels?.(labels.filter((l) => l.checked));
          }}
          onUpdate={(lbl) => {
            setLabels((prev) => prev.map((p) => (p.id === lbl.id ? { ...p, name: lbl.name, color: lbl.color } : p)));
            onSaveLabels?.(labels.filter((l) => l.checked));
          }}
          onDelete={(id) => {
            setLabels((prev) => prev.filter((p) => p.id !== id));
            onSaveLabels?.(labels.filter((l) => l.checked));
          }}
        />

        <DatesPopover
          open={datesOpen}
          anchorRef={datesBtnRef}
          value={due}
          complete={dueComplete}
          onClose={() => setDatesOpen(false)}
          onSave={(res: DatesResult) => {
            setDue(res.due);
            setDueComplete(res.complete);
            onSaveDates?.({ dueDate: res.due, dueComplete: res.complete });
          }}
        />

        <ChecklistPopover
          open={checklistOpen}
          anchorRef={checklistBtnRef}
          onClose={() => setChecklistOpen(false)}
          onSave={(t) => {
            const created: Checklist = { id: crypto.randomUUID(), title: t, items: [] };
            const next = [...lists, created];
            setLists(next);
            onSaveChecklists?.(next);
            setChecklistOpen(false);
          }}
        />

        <MembersPopover
          open={membersOpen}
          anchorRef={membersBtnRef}
          onClose={() => setMembersOpen(false)}
          team={[
            { id: "u1", name: "Marko Marić" },
            { id: "u2", name: "Jelena Jelić" },
            { id: "u3", name: "Milan Nikolić" },
          ]}
          initialSelected={members.map((m) => m.id)}
          onSave={(ids) => {
            const lookup = new Map<string, string>([
              ["u1", "Marko Marić"],
              ["u2", "Jelena Jelić"],
              ["u3", "Milan Nikolić"],
            ]);
            const mapped: Member[] = ids.map((id) => ({ id, fullName: lookup.get(id) ?? id }));
            setMembers(mapped);
            onSaveMembers?.(mapped);
          }}
        />

        {/* Delete comment popover */}
        <CommentDeletePopover
          open={!!delState.id && !!delState.anchor}
          anchorEl={delState.anchor}
          onClose={() => setDelState({ id: null, anchor: null })}
          onConfirm={confirmDeleteComment}
        />
      </div>
    </div>
  );
}

/* -------------------------- UI helper -------------------------- */
const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  { icon: React.ReactNode; label: string; onClick?: () => void }
>(function ToolbarButton({ icon, label, onClick }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-[#177de5] hover:bg-zinc-50 cursor-pointer"
      type="button"
    >
      {icon}
      {label}
    </button>
  );
});

/* ---------------- Delete comment popover ---------------- */
function CommentDeletePopover({
  open,
  anchorEl,
  onClose,
  onConfirm,
}: {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const popRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open || !anchorEl) return;
    const r = anchorEl.getBoundingClientRect();
    const w = 300;
    const top = r.bottom + window.scrollY + 8;
    let left = r.left + window.scrollX - (w - r.width);
    const maxLeft = window.scrollX + window.innerWidth - w - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    setPos({ top, left });
  }, [open, anchorEl]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const p = popRef.current;
      if (p && !p.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDoc, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60, width: 300 }}
      className="rounded-lg border border-zinc-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-800">Delete comment?</div>
        <button
          onClick={onClose}
          className="inline-grid h-7 w-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 cursor-pointer"
          type="button"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="text-sm text-zinc-700">
        Deleting a comment is forever. There is no undo.
      </div>
      <button
        onClick={() => { onConfirm(); onClose(); }}
        className="mt-3 w-full rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 cursor-pointer"
        type="button"
        title="Delete comment"
      >
        Delete comment
      </button>
    </div>,
    document.body
  );
}
