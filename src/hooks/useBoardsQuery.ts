// src/hooks/useBoardsQuery.ts
import * as React from "react";
import type { Board, FilterKind, SortKind } from "@/features/boards/types";
import { fetchBoards, toggleStar } from "@/features/boards/api";

export function useBoardsQuery(opts: { q: string; filter: FilterKind; sort: SortKind }) {
  const [boards, setBoards] = React.useState<Board[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { q, filter, sort } = opts;

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const data = await fetchBoards({ q, filter, sort });
      setBoards(data);
    } catch (e: unknown) {
      setBoards([]);
      setError(e instanceof Error ? e.message : "Failed to load boards");
    }
  }, [q, filter, sort]);

  React.useEffect(() => { void load(); }, [load]);

  const onToggleStar = React.useCallback(async (id: number) => {
    // snapshot za rollback
    let snapshot: Board[] | null = null;

    setBoards(prev => {
      snapshot = prev ? [...prev] : prev;
      if (!prev) return prev;

      if (filter === "starred") {
        // odmah skloni sa liste u Starred tabu
        return prev.filter(b => b.id !== id);
      }
      // u drugim tabovima samo flipuj zvezdicu
      return prev.map(b => (b.id === id ? { ...b, isStarred: !b.isStarred } : b));
    });

    try {
      await toggleStar(id);
    } catch {
      // rollback na snapshot ako API padne
      setBoards(snapshot);
    }
  }, [filter]);

  return { boards, isLoading: boards === null, error, reload: load, toggleStar: onToggleStar };
}
