import { api } from "@/lib/http";
import type { Board, FilterKind, SortKind } from "./types";

export async function fetchBoards(params: { q?: string; filter?: FilterKind; sort?: SortKind }): Promise<Board[]> {
  const { data } = await api.get("/api/v1/boards", { params });
  return data as Board[];
}

export async function toggleStar(boardId: number): Promise<void> {
  await api.patch(`/api/v1/boards/${boardId}/star`);
}

export async function createBoard(payload: {
  title: string;
  privacy: "private" | "team";
  team_id?: number;
  tags?: string[];
}): Promise<Board> {
  const { data } = await api.post("/api/v1/boards", payload);
  return data as Board;
}

export async function updateBoard(boardId: number, payload: Partial<{ title: string; privacy: "private" | "team"; team_id?: number; tags?: string[] }>): Promise<Board> {
  const { data } = await api.patch(`/api/v1/boards/${boardId}`, payload, {
    validateStatus: (s) => s >= 200 && s < 300,
  });
  return data as Board;
}

export async function deleteBoard(boardId: number): Promise<void> {
  await api.delete(`/api/v1/boards/${boardId}`);
}
