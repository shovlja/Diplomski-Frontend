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
import { useAuth } from "@/features/auth/AuthContext";
import type { Checklist, LabelItem, Member } from "@/features/boards/board";
import {
  createChecklist as apiCreateChecklist,
  addChecklistItem as apiAddChecklistItem,
  updateChecklistItem as apiUpdateChecklistItem,
  deleteChecklist as apiDeleteChecklist,
  createLabel as apiCreateLabel,
  updateLabel as apiUpdateLabel,
  deleteLabel as apiDeleteLabel,
} from "@/features/boards/api";

/* ---------- helpers ---------- */
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
  boardId: number;
  boardTeamId?: number;
  onClose: () => void;

  onSaveTitle?: (value: string) => void;
  onSaveDescription?: (value: string) => void;
  onSaveLabels?: (labels: LabelItem[]) => void;
  onSaveDates?: (data: { dueDate: string | null; dueComplete: boolean }) => void;
  onSaveChecklists?: (lists: Checklist[] | undefined) => void;
  onSaveMembers?: (members: Member[]) => void;
  onSaveComments?: (comments: CommentItem[]) => void;

  /** Board-level katalog; opciono */
  labelsCatalog?: LabelItem[];
  onLabelsCatalogChange?: (next: LabelItem[]) => void;
};

// ⚠️ NEMA freeze (pravio readonly tip)
const EMPTY_LABELS = [] as LabelItem[]; // stabilna, nemoj je mutirati
const NOOP = () => {};

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const initials = (name: string) =>
  name.split(" ").map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("");

function fuseCatalogWithSelected(catalog: LabelItem[], selected?: LabelItem[]): LabelItem[] {
  const sel = new Set((selected ?? []).map((s) => s.id));
  return catalog.map((l) => ({ ...l, checked: sel.has(l.id) }));
}

export default function CardDialog({
  open,
  card,
  listTitle,
  boardId,
  boardTeamId,
  onClose,
  onSaveTitle,
  onSaveDescription,
  onSaveLabels,
  onSaveDates,
  onSaveChecklists,
  onSaveMembers,
  onSaveComments,
  labelsCatalog: labelsCatalogProp,
  onLabelsCatalogChange: onLabelsCatalogChangeProp,
}: Props) {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const labelsCatalog = labelsCatalogProp ?? EMPTY_LABELS;
  const onLabelsCatalogChange = onLabelsCatalogChangeProp ?? NOOP;

  const { user } = useAuth();
  const currentUserName = user?.display_name?.trim() || user?.email?.trim() || "User";

  // state
  const [title, setTitle] = React.useState<string>(card.title);
  const [labelsLocal, setLabelsLocal] = React.useState<LabelItem[]>(
    fuseCatalogWithSelected(labelsCatalog, card.labels)
  );
  const [due, setDue] = React.useState<string | null>(card.dueDate ?? null);
  const [dueComplete, setDueComplete] = React.useState<boolean>(!!card.dueComplete);
  const [lists, setLists] = React.useState<Checklist[]>(Array.isArray(card.checklists) ? card.checklists : []);
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({});
  const [members, setMembers] = React.useState<Member[]>(card.members ?? []);
  const [desc, setDesc] = React.useState<string>(card.description ?? "");
  const [descDraft, setDescDraft] = React.useState<string>(card.description ?? "");
  const [editingDesc, setEditingDesc] = React.useState<boolean>(false);
  const [comments, setComments] = React.useState<CommentItem[]>(card.comments ?? []);
  const [commentText, setCommentText] = React.useState<string>("");

  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [commentDraft, setCommentDraft] = React.useState<string>("");
  const [delState, setDelState] = React.useState<{ id: string | null; anchor: HTMLElement | null }>({ id: null, anchor: null });

  // popover refs
  const labelsToolbarBtnRef = React.useRef<HTMLButtonElement>(null);
  const labelsPlusBtnRef = React.useRef<HTMLButtonElement>(null);
  const datesBtnRef = React.useRef<HTMLButtonElement>(null);
  const checklistBtnRef = React.useRef<HTMLButtonElement>(null);
  const membersBtnRef = React.useRef<HTMLButtonElement>(null);

  const [labelsAnchor, setLabelsAnchor] = React.useState<"toolbar" | "plus">("toolbar");
  const [labelsOpen, setLabelsOpen] = React.useState<boolean>(false);
  const [datesOpen, setDatesOpen] = React.useState<boolean>(false);
  const [checklistOpen, setChecklistOpen] = React.useState<boolean>(false);
  const [membersOpen, setMembersOpen] = React.useState<boolean>(false);

  // sync na promenu kartice ILI board kataloga
  React.useEffect(() => {
    setTitle(card.title);
    setLabelsLocal(fuseCatalogWithSelected(labelsCatalog, card.labels));
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
  }, [card, labelsCatalog]);

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

  const selectedLabels = labelsLocal.filter((l) => l.checked);
  const labelsAnchorEl: HTMLElement | null =
    labelsAnchor === "plus" ? labelsPlusBtnRef.current : labelsToolbarBtnRef.current;

  const sums = lists.reduce(
    (acc, list) => {
      acc.total += list.items.length;
      acc.done += list.items.filter((i) => i.done).length;
      return acc;
    },
    { done: 0, total: 0 }
  );
  const pctAll = sums.total ? Math.round((sums.done / sums.total) * 100) : 0;
  const allDone = sums.total > 0 && sums.done === sums.total;

  function addComment() {
    const text = commentText.trim();
    if (!text) return;
    const c: CommentItem = { id: crypto.randomUUID(), author: currentUserName, createdAt: new Date().toISOString(), text };
    const next = [c, ...comments];
    setComments(next);
    setCommentText("");
    onSaveComments?.(next);
  }

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
        {/* Header */}
        <div className="lg:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500">
              {listTitle} <span className="mx-1">/</span> <span className="font-medium text-zinc-700">Card</span>
            </div>
            {sums.total > 0 && (
              <div className={`hidden md:flex items-center gap-2 rounded-full border px-3 py-1
                  ${allDone ? "border-green-300 bg-green-50" : "border-zinc-200 bg-zinc-50"}`}>
                <div className="w-24"><ProgressBar value={pctAll} /></div>
                <span className={`text-xs ${allDone ? "text-green-700" : "text-zinc-600"}`}>{pctAll}%</span>
                {allDone && <span className="ml-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Complete</span>}
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
          {/* Title */}
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

          {/* Labels + Due */}
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
                  onClick={() => { setEditingDesc(true); setDescDraft(desc); }}
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
                  onClick={() => { setEditingDesc(true); setDescDraft(""); }}
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
                  <Button onClick={() => { setDesc(descDraft); onSaveDescription?.(descDraft); setEditingDesc(false); }} className="cursor-pointer">
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
                      onClick={async () => {
                        try {
                          await apiDeleteChecklist(cl.id);
                          const next = lists.filter((x) => x.id !== cl.id);
                          setLists(next);
                          onSaveChecklists?.(next.length ? next : undefined);
                        } catch (e) {
                          console.error("delete checklist failed", e);
                        }
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                }
              >
                <div className={`mb-2 text-xs ${pct === 100 ? "text-green-700" : "text-zinc-600"}`}>{Math.round(pct)}%</div>
                <ProgressBar value={pct} />
                <div className="mt-3 space-y-1">
                  {(hide ? cl.items.filter((i) => !i.done) : cl.items).map((it, i) => (
                    <label key={it.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={it.done}
                        onChange={async (e) => {
                          const checked = e.currentTarget.checked;
                          try {
                            await apiUpdateChecklistItem(it.id, { done: checked });
                            const next = lists.map((l) =>
                              l.id === cl.id ? { ...l, items: l.items.map((x, ii) => (ii === i ? { ...x, done: checked } : x)) } : l
                            );
                            setLists(next);
                            onSaveChecklists?.(next);
                          } catch (err) {
                            console.error("update checklist item failed", err);
                          }
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
                    onKeyDown={async (e) => {
                      const target = e.currentTarget as HTMLInputElement;
                      if (e.key === "Enter" && target.value.trim()) {
                        try {
                          const item = await apiAddChecklistItem(cl.id, target.value.trim());
                          const next = lists.map((l) =>
                            l.id === cl.id ? { ...l, items: [...l.items, item] } : l
                          );
                          setLists(next);
                          onSaveChecklists?.(next);
                          target.value = "";
                        } catch (err) {
                          console.error("add checklist item failed", err);
                        }
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
              const canEdit = c.author === currentUserName;
              return (
                <div key={c.id} className="flex items-start gap-2">
                  <div className="mt-0.5 inline-grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7C3AED] text-[11px] font-semibold text-white">
                    {initials(c.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-zinc-800">{c.author}</div>
                      <span className="text-xs text-zinc-500">{fmtDateTime(c.createdAt)}</span>
                    </div>

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
                          <Button
                            onClick={() => {
                              const trimmed = commentDraft.trim();
                              if (!trimmed) return;
                              const next = comments.map((ci) => (ci.id === c.id ? { ...ci, text: trimmed } : ci));
                              setComments(next);
                              setEditingCommentId(null);
                              setCommentDraft("");
                              onSaveComments?.(next);
                            }}
                            className="h-8 px-3 cursor-pointer"
                          >
                            Save
                          </Button>
                          <Button variant="ghost" onClick={() => { setEditingCommentId(null); setCommentDraft(""); }} className="h-8 px-3 cursor-pointer">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {!isEditing && canEdit && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                        <button
                          onClick={() => { setEditingCommentId(c.id); setCommentDraft(c.text); }}
                          className="hover:underline text-zinc-700 cursor-pointer"
                          type="button"
                          title="Edit comment"
                        >
                          Edit
                        </button>
                        <span>•</span>
                        <button
                          onClick={(e) => setDelState({ id: c.id, anchor: e.currentTarget as HTMLElement })}
                          className="hover:underline text-rose-600 cursor-pointer"
                          type="button"
                          title="Delete comment"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Popovers */}
        <LabelsPopover
          open={labelsOpen}
          anchorEl={labelsAnchorEl}
          onClose={() => {
            setLabelsOpen(false);
            onSaveLabels?.(selectedLabels);
          }}
          labels={labelsLocal}
          onToggle={(id: number) =>
            setLabelsLocal((prev) => prev.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)))
          }
          onCreate={async ({ name, color }) => {
            try {
              const saved = await apiCreateLabel(boardId, { name, color });
              onLabelsCatalogChange([...labelsCatalog, saved]);           // board katalog
              setLabelsLocal((prev) => [...prev, { ...saved, checked: true }]); // lokalno + čekiraj
            } catch (e) {
              console.error("create label failed", e);
            }
          }}
          onUpdate={async ({ id, name, color }) => {
            try {
              const saved = await apiUpdateLabel(id, { name, color });
              onLabelsCatalogChange(labelsCatalog.map((p) => (p.id === id ? { ...p, name: saved.name, color: saved.color } : p)));
              setLabelsLocal((prev) => prev.map((p) => (p.id === id ? { ...p, name: saved.name, color: saved.color } : p)));
            } catch (e) {
              console.error("update label failed", e);
            }
          }}
          onDelete={async (id: number) => {
            try {
              await apiDeleteLabel(id);
              onLabelsCatalogChange(labelsCatalog.filter((p) => p.id !== id));
              setLabelsLocal((prev) => prev.filter((p) => p.id !== id));
            } catch (e) {
              console.error("delete label failed", e);
            }
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
          onSave={async (t: string) => {
            try {
              const created = await apiCreateChecklist(card.id, t);
              const next = [...lists, created];
              setLists(next);
              onSaveChecklists?.(next);
              setChecklistOpen(false);
            } catch (e) {
              console.error("create checklist failed", e);
            }
          }}
        />

        <MembersPopover
          open={membersOpen}
          anchorRef={membersBtnRef}
          onClose={() => setMembersOpen(false)}
          teamId={boardTeamId}
          initialSelected={members.map((m) => m.id)}
          onSave={(ids: Member["id"][], rows: { id: Member["id"]; name: string }[]) => {
            const map = new Map<Member["id"], string>(rows.map((r) => [r.id, r.name]));
            const mapped: Member[] = ids.map((id) => ({ id, display_name: map.get(id) ?? String(id) } as Member));
            setMembers(mapped);
            onSaveMembers?.(mapped);
          }}
        />

        {/* Delete comment popover */}
        <CommentDeletePopover
          open={!!delState.id && !!delState.anchor}
          anchorEl={delState.anchor}
          onClose={() => setDelState({ id: null, anchor: null })}
          onConfirm={() => {
            if (!delState.id) return;
            const next = comments.filter((c) => c.id !== delState.id);
            setComments(next);
            setDelState({ id: null, anchor: null });
            onSaveComments?.(next);
          }}
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
      <div className="text-sm text-zinc-700">Deleting a comment is forever. There is no undo.</div>
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
