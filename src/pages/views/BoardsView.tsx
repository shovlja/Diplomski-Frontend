import * as React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import BoardsToolbar from "@/components/ui/boards/BoardsToolbar";
import BoardCard from "@/components/ui/boards/BoardCard";
import CreateBoardCard from "@/components/ui/boards/CreateBoardCard";
import SkeletonCard from "@/components/ui/boards/SkeletonCard";
import { useBoardsQuery } from "@/hooks/useBoardsQuery";
import type { FilterKind, SortKind } from "@/features/boards/types";

export default function BoardsView() {
  const { boards, isLoading, toggleStar } = useBoardsQuery();

  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<FilterKind>("all");
  const [sort, setSort] = React.useState<SortKind>("activity_desc");

  const filtered = React.useMemo(() => {
    if (!boards) return null;
    let arr = boards.slice();

    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter((b) => b.title.toLowerCase().includes(qq) || (b.teamName ?? "").toLowerCase().includes(qq));
    }
    if (filter === "starred") arr = arr.filter((b) => b.isStarred);
    if (filter === "mine") arr = arr.filter((b) => b.privacy !== "public"); // placeholder

    arr.sort((a, b) => {
      if (sort === "activity_desc") return +new Date(b.lastActivity) - +new Date(a.lastActivity);
      if (sort === "activity_asc") return +new Date(a.lastActivity) - +new Date(b.lastActivity);
      if (sort === "title_asc") return a.title.localeCompare(b.title);
      if (sort === "title_desc") return b.title.localeCompare(a.title);
      return 0;
    });

    return arr;
  }, [boards, q, filter, sort]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Boards</h1>
          <p className="text-sm text-zinc-500">All your project boards in one place.</p>
        </div>
        <Button
            asChild
            className="inline-flex h-9 gap-1 whitespace-nowrap px-5" rounded="full"
        >
            <Link to="/boards/new">
            
            <span className="inline-flex items-center gap-1"><Plus className="h-4 w-4 shrink-0" />New board</span>
            </Link>
        </Button>
      </div>

      <BoardsToolbar
        q={q}
        setQ={setQ}
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <CreateBoardCard />
          {filtered.map((b) => (
            <BoardCard key={b.id} board={b} onToggleStar={toggleStar} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16">
          <div className="text-center">
            <div className="mb-2 text-lg font-semibold text-zinc-900">No boards found</div>
            <p className="mb-4 text-sm text-zinc-600">Try adjusting your search or create a new board.</p>
            <Button asChild variant="outline" className="hover:bg-zinc-100">
              <Link to="/boards/new">
                <span className="inline-flex items-center gap-1"><Plus className="h-4 w-4 shrink-0" />Create board</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
