import * as React from "react";
import BoardsToolbar from "@/components/ui/boards/BoardsToolbar";
import BoardCard from "@/components/ui/boards/BoardCard";
import CreateBoardCard from "@/components/ui/boards/CreateBoardCard";
import CreateBoardDialog from "@/components/ui/boards/CreateBoardDialog";
import UpdateBoardDialog from "@/components/ui/boards/UpdateBoardDialog";
import SkeletonCard from "@/components/ui/boards/SkeletonCard";
import { useBoardsQuery } from "@/hooks/useBoardsQuery";
import type { Board, FilterKind, SortKind } from "@/features/boards/types";
import { listMyTeams, getTeamDetails } from "@/features/teams/api";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function BoardsView() {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<FilterKind>("all");
  const [sort, setSort] = React.useState<SortKind>("activity_desc");

  const { boards, isLoading, error, toggleStar, reload } = useBoardsQuery({ q, filter, sort });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editBoard, setEditBoard] = React.useState<Board | null>(null);

  const { user } = useAuth(); // user.id = UUID string

  // Provider: vrati samo {id,name} timove gde sam OWNER
  const ownerTeamsProvider = React.useCallback(async () => {
    const my = await listMyTeams();
    const details = await Promise.all(my.map((t) => getTeamDetails(t.id)));
    const myId = String(user?.id ?? "");
    return details
      .filter((team) => team.members?.some((m) => m.user_id === myId && m.role === "owner"))
      .map((team) => ({ id: team.id, name: team.name }));
  }, [user?.id]);

  // Optimistično ponašanje posle brisanja (bez neiskorišćenog parametra)
  const onDeleted = React.useCallback(() => {
    toast.message("Deleting…");
    setTimeout(() => void reload(), 400);
  }, [reload]);

  return (
    <div className="p-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <p className="text-sm text-zinc-500">All your project boards in one place.</p>
      </div>

      <BoardsToolbar
        q={q}
        setQ={setQ}
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
      />

      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <CreateBoardCard onClick={() => setCreateOpen(true)} />
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
        {!isLoading &&
          boards?.map((b) => (
            <BoardCard
              key={b.id}
              board={b}
              onToggleStar={toggleStar}
              onDeleted={onDeleted}
              onEdit={(brd) => setEditBoard(brd)}
            />
          ))}
      </div>

      <CreateBoardDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
        teamsProvider={ownerTeamsProvider}
      />

      <UpdateBoardDialog
        open={!!editBoard}
        board={editBoard}
        onClose={() => setEditBoard(null)}
        onUpdated={reload}
        teamsProvider={ownerTeamsProvider}
      />
    </div>
  );
}
