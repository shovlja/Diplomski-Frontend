import * as React from "react";
import type { Board } from "../types";
import { TOKENS } from "@/lib/tokens";

export function useBoardsQuery() {
  const [boards, setBoards] = React.useState<Board[] | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setBoards([
        {
          id: 1,
          title: "PMHub – Core Roadmap",
          teamName: "Platform",
          privacy: "team",
          isStarred: true,
          lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          cover: `linear-gradient(135deg, ${TOKENS.accent} 0%, rgba(34,211,238,0.15) 100%)`,
          members: [{ id: 1, name: "Ana Nikolić" }, { id: 2, name: "Petar Šovljanski" }, { id: 3, name: "Milan Jovanović" }],
        },
        {
          id: 2,
          title: "Marketing Sprint Board",
          teamName: "Marketing",
          privacy: "team",
          isStarred: false,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          cover: "#f0fdff",
          members: [{ id: 4, name: "Ivana Petrović" }, { id: 5, name: "Marko Ilić" }],
        },
        {
          id: 3,
          title: "Personal TODO",
          privacy: "private",
          isStarred: true,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
          cover: "#ecfeff",
          members: [{ id: 6, name: "Administrator" }],
        },
        {
          id: 4,
          title: "Design System Tasks",
          teamName: "Design",
          privacy: "team",
          isStarred: false,
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
          cover: "#f8fafc",
          members: [
            { id: 7, name: "Masa K." },
            { id: 8, name: "Igor R." },
            { id: 9, name: "Uroš B." },
            { id: 10, name: "Ema D." },
          ],
        },
      ]);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const toggleStar = React.useCallback((id: number) => {
    setBoards(prev => prev?.map(b => (b.id === id ? { ...b, isStarred: !b.isStarred } : b)) ?? prev);
    // TODO: PATCH /boards/:id/star
  }, []);

  return { boards, isLoading: boards === null, toggleStar };
}
