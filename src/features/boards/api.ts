import { api } from "@/lib/http";
import type { Board as BoardsListBoard, FilterKind, SortKind } from "./types";
import type { LabelItem, Checklist, ChecklistItem, Member, Card as BaseCard } from "./board";

/* ------------------------------------------------------------------ */
/* Listing                                                            */
/* ------------------------------------------------------------------ */

export async function fetchBoards(params: { q?: string; filter?: FilterKind; sort?: SortKind }): Promise<BoardsListBoard[]> {
  const { data } = await api.get("/api/v1/boards", { params });
  return data as BoardsListBoard[];
}

export async function toggleStar(boardId: number): Promise<void> {
  await api.patch(`/api/v1/boards/${boardId}/star`);
}

export async function createBoard(payload: {
  title: string;
  privacy: "private" | "team";
  team_id?: number;
  tags?: string[];
}): Promise<BoardsListBoard> {
  const { data } = await api.post("/api/v1/boards", payload);
  return data as BoardsListBoard;
}

export async function updateBoard(
  boardId: number,
  payload: Partial<{ title: string; privacy: "private" | "team"; team_id?: number; tags?: string[] }>
): Promise<BoardsListBoard> {
  const { data } = await api.patch(`/api/v1/boards/${boardId}`, payload, {
    validateStatus: (s) => s >= 200 && s < 300,
  });
  return data as BoardsListBoard;
}

export async function deleteBoard(boardId: number): Promise<void> {
  await api.delete(`/api/v1/boards/${boardId}`);
}

/* ------------------------------------------------------------------ */
/* BoardView API – tipovi koje vraćamo BoardView-u                    */
/* ------------------------------------------------------------------ */

export type ViewComment = { id: string; author: string; createdAt: string; text: string };

export type ViewCard = BaseCard & {
  dueComplete?: boolean;
  members?: Member[];
  checklists?: Checklist[];
  comments?: ViewComment[];
};

export type ViewList = { id: number; title: string; position: number; cards: ViewCard[] };
export type BoardPayload = { id: number; title: string; teamId?: number | null; lists: ViewList[] };

/* Raw tipovi (snake_case sa backa) */
type RawLabel = { id: number; name: string; color: string };
type RawMember = { id: string; full_name?: string; fullName?: string; display_name?: string; displayName?: string; avatar_url?: string | null; avatarUrl?: string | null };
type RawChecklistItem = { id: string; text: string; done: boolean };
type RawChecklist = { id: string; title: string; items: RawChecklistItem[] };
type RawCard = {
  id: number;
  title: string;
  position: number;
  description?: string | null;
  labels?: RawLabel[];
  due_date?: string | null;
  dueDate?: string | null;
  due_complete?: boolean;
  dueComplete?: boolean;
  attachments_count?: number;
  attachmentsCount?: number;
  members?: RawMember[];
  checklists?: RawChecklist[];
  comments?: { id: string; author: string; created_at?: string; createdAt?: string; text: string }[];
};
type RawList = { id: number; title: string; position: number; cards: RawCard[] };
type RawBoard = { id: number; title: string; team_id?: number | null; teamId?: number | null; lists: RawList[] };

function mapLabel(r: RawLabel): LabelItem {
  return { id: r.id, name: r.name, color: r.color };
}
function mapMember(r: RawMember): Member {
  const fn = r.displayName ?? r.display_name ?? r.fullName ?? r.full_name ?? r.id;
  return { id: r.id, display_name: fn, avatarUrl: r.avatarUrl ?? r.avatar_url ?? undefined };
}
function mapChecklistItem(r: RawChecklistItem): ChecklistItem {
  return { id: r.id, text: r.text, done: r.done };
}
function mapChecklist(r: RawChecklist): Checklist {
  return { id: r.id, title: r.title, items: (r.items ?? []).map(mapChecklistItem) };
}
function mapCard(r: RawCard): ViewCard {
  return {
    id: r.id,
    title: r.title,
    position: r.position,
    description: r.description ?? undefined,
    labels: (r.labels ?? []).map(mapLabel),
    dueDate: r.dueDate ?? r.due_date ?? null,
    dueComplete: r.dueComplete ?? r.due_complete ?? false,
    attachmentsCount: r.attachmentsCount ?? r.attachments_count ?? 0,
    members: (r.members ?? []).map(mapMember),
    checklists: (r.checklists ?? []).map(mapChecklist),
    comments: (r.comments ?? []).map((c) => ({
      id: c.id,
      author: c.author,
      createdAt: c.createdAt ?? c.created_at ?? new Date().toISOString(),
      text: c.text,
    })),
  };
}
function mapList(r: RawList): ViewList {
  return { id: r.id, title: r.title, position: r.position, cards: (r.cards ?? []).map(mapCard) };
}

export async function getBoard(boardId: number): Promise<BoardPayload> {
  const { data } = await api.get<RawBoard>(`/api/v1/boards/${boardId}`);
  return {
    id: data.id,
    title: data.title,
    teamId: data.teamId ?? data.team_id ?? null,
    lists: (data.lists ?? []).map(mapList),
  };
}

/* ---------------- Lists ---------------- */
export async function createList(boardId: number, title: string): Promise<ViewList> {
  const { data } = await api.post<RawList>(`/api/v1/boards/${boardId}/lists`, { title });
  return mapList({ ...data, cards: data.cards ?? [] });
}

export async function updateList(listId: number, patch: Partial<Pick<ViewList, "title" | "position">>): Promise<ViewList> {
  const { data } = await api.patch<RawList>(`/api/v1/lists/${listId}`, patch);
  return mapList({ ...data, cards: data.cards ?? [] });
}

export async function deleteList(listId: number): Promise<void> {
  await api.delete(`/api/v1/lists/${listId}`);
}

export async function reorderLists(boardId: number, listIds: number[]): Promise<void> {
  await api.post(`/api/v1/boards/${boardId}/lists/reorder`, { list_ids: listIds });
}

/* ---------------- Cards ---------------- */
export async function createCard(listId: number, title: string): Promise<ViewCard> {
  const { data } = await api.post<RawCard>(`/api/v1/lists/${listId}/cards`, { title });
  return mapCard(data);
}

/** Polja koja backend patchuje na kartici */
export type CardPatch = Partial<{
  title: string;
  description: string;
  dueDate: string | null;
  dueComplete: boolean;
}>;

export async function updateCard(cardId: number, patch: CardPatch): Promise<void> {
  await api.patch(`/api/v1/cards/${cardId}`, patch);
}

export async function reorderCards(listId: number, cardIds: number[]): Promise<void> {
  await api.post(`/api/v1/lists/${listId}/cards/reorder`, { card_ids: cardIds });
}

/* ---------------- Labels ---------------- */
export async function getBoardLabels(boardId: number): Promise<LabelItem[]> {
  const { data } = await api.get(`/api/v1/boards/${boardId}/labels`);
  return data;
}

export async function createLabel(boardId: number, body: { name: string; color: string }): Promise<LabelItem> {
  const { data } = await api.post(`/api/v1/boards/${boardId}/labels`, body);
  return data;
}

export async function updateLabel(labelId: number, body: Partial<{ name: string; color: string }>): Promise<LabelItem> {
  const { data } = await api.patch(`/api/v1/labels/${labelId}`, body);
  return data;
}

export async function deleteLabel(labelId: number): Promise<void> {
  await api.delete(`/api/v1/labels/${labelId}`);
}

export async function setCardLabels(cardId: number, labelIds: number[]): Promise<void> {
  await api.put(`/api/v1/cards/${cardId}/labels`, { label_ids: labelIds });
}


/* ---------------- Members ---------------- */
export async function setCardMembers(cardId: number, memberIds: string[]): Promise<void> {
  await api.put(`/api/v1/cards/${cardId}/members`, { member_ids: memberIds });
}

/* ---------------- Comments ---------------- */
type AddCommentOut = { id: string; createdAt?: string; created_at?: string };
export async function addComment(cardId: number, author: string, text: string): Promise<{ id: string; createdAt: string }> {
  const { data } = await api.post<AddCommentOut>(`/api/v1/comments`, { card_id: cardId, author, text });
  const createdAt = (data.createdAt ?? data.created_at ?? new Date().toISOString());
  return { id: data.id, createdAt };
}
export async function editComment(commentId: string, text: string): Promise<void> {
  await api.patch(`/api/v1/comments/${commentId}`, { text });
}
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/api/v1/comments/${commentId}`);
}

export async function replaceCardComments(
  cardId: number,
  comments: { id: string; author: string; createdAt: string; text: string }[]
): Promise<void> {
  await api.put(`/api/v1/cards/${cardId}/comments`, { comments });
}

/* ---------------- Checklists ---------------- */
export async function createChecklist(cardId: number, title: string): Promise<Checklist> {
  const { data } = await api.post<Checklist>(`/api/v1/cards/${cardId}/checklists`, { title });
  return data;
}
export async function deleteChecklist(checklistId: string): Promise<void> {
  await api.delete(`/api/v1/checklists/${checklistId}`);
}
export async function addChecklistItem(checklistId: string, text: string): Promise<ChecklistItem> {
  const { data } = await api.post<ChecklistItem>(`/api/v1/checklists/${checklistId}/items`, { text });
  return data;
}
export async function updateChecklistItem(itemId: string, patch: Partial<ChecklistItem>): Promise<ChecklistItem> {
  const { data } = await api.patch<ChecklistItem>(`/api/v1/checklist-items/${itemId}`, patch);
  return data;
}
