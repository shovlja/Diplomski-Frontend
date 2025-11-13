// src/components/ui/teams/TeamCard.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { Users, Star, StarOff, MoreHorizontal } from "lucide-react";
import type { TeamBrief } from "@/features/teams/types";
import { TOKENS } from "@/lib/tokens";
import { useAuth } from "@/features/auth/AuthContext";

type Props = {
  team: TeamBrief;
  onToggleStar: (id: number, next: boolean) => void;
  onOpenMembers: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void; // parent odlučuje leave vs delete
};

// members možda su samo {id}, a možda imaju i user_id/role
type MaybeId = string | number | undefined;
const sameId = (a: MaybeId, b: MaybeId) =>
  a != null && b != null && String(a) === String(b);

type MaybeMember = { id: number } & Partial<{
  user_id: number | string;
  role: "owner" | "manager" | "developer" | string;
}>;

export default function TeamCard({
  team,
  onToggleStar,
  onOpenMembers,
  onEdit,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // close on outside click / Escape
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const starred = !!team.is_starred;

  const isOwner = React.useMemo(() => {
    const members = (team.members ?? []) as unknown as MaybeMember[];
    return members.some((m) => sameId(m.user_id, user?.id) && m.role === "owner");
  }, [team.members, user?.id]);

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow",
        "border-zinc-200 hover:shadow-md hover:border-[rgb(34,211,238)]",
      ].join(" ")}
    >
      <Link to={`/teams/${team.id}`} className="block">
        <div className="h-6 w-full bg-gradient-to-b from-cyan-50 to-transparent" />
      </Link>

      {/* star button */}
      <button
        onClick={() => onToggleStar(team.id, !starred)}
        className="absolute right-2 top-2 inline-grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow ring-1 ring-zinc-200 transition hover:bg-white cursor-pointer"
        title={starred ? "Unstar" : "Star"}
      >
        {starred ? (
          <Star className="h-4 w-4" style={{ color: TOKENS.accent }} />
        ) : (
          <StarOff className="h-4 w-4 text-zinc-600" />
        )}
      </button>

      {/* kebab */}
      <div className="absolute right-2 top-2 translate-x-[-44px]">
        <div ref={menuRef} className="relative">
          <button
            className="inline-grid h-8 w-8 place-items-center rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            title="More"
            onClick={() => setOpen((v) => !v)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
              {/* Edit samo za ownere */}
              {isOwner && (
                <button
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    onEdit(team.id);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  onDelete(team.id, team.name); // parent odlučuje leave vs delete
                }}
              >
                Leave and delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-3">
        <div className="mb-2 grid place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-900/90 text-white shadow-md">
            {team.name.slice(0, 1).toUpperCase()}
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <Link
            to={`/teams/${team.id}`}
            className="line-clamp-1 font-semibold text-zinc-900 hover:underline"
          >
            {team.name}
          </Link>
        </div>

        {/* Description (NEW) */}
        {team.description ? (
          <p className="mt-1 line-clamp-2 text-center text-sm text-zinc-600">
            {team.description}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
          <button
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-zinc-100 cursor-pointer"
            onClick={() => onOpenMembers(team.id)}
            title="Members"
          >
            <Users className="h-4 w-4" />
            <span>Members: {team.members?.length ?? 0}</span>
          </button>
          <div className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
