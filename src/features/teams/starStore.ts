// src/features/teams/starStore.ts
import * as React from "react";

const LS_KEY = "pmhub.teamStars:v1";

function loadFromStorage(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set<number>();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr.filter((x) => Number.isFinite(x)));
  } catch {
    return new Set<number>();
  }
}

function saveToStorage(stars: Set<number>) {
  const arr = Array.from(stars.values());
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export function useTeamStars() {
  const [stars, setStars] = React.useState<Set<number>>(() => loadFromStorage());

  // cross-tab sync
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LS_KEY) setStars(loadFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isStarred = React.useCallback((id: number) => stars.has(id), [stars]);

  const toggleStar = React.useCallback((id: number) => {
    setStars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // persist
      saveToStorage(next);
      return next;
    });
  }, []);

  const setMany = React.useCallback((ids: number[]) => {
    const next = new Set<number>(ids);
    saveToStorage(next);
    setStars(next);
  }, []);

  return { stars, isStarred, toggleStar, setMany };
}
