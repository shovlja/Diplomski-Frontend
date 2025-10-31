// src/pages/views/TeamsView.tsx
import * as React from "react";
import { MoreHorizontal, Users, Search, Star, StarOff, AlertTriangle } from "lucide-react";
import Input from "@/components/ui/Input";
import TeamMembersDialog from "@/components/ui/teams/TeamsMembersDialog";
import SkeletonTeamCard from "@/components/ui/teams/SkeletonTeamCard";
import EditTeamDialog from "@/components/ui/teams/EditTeamDialog";
import CreateTeamDialog from "@/components/ui/teams/CreateTeamDialog";
import { useTeamsMe, deleteTeamAction } from "@/hooks/useTeamsQuery";
import { getTeamDetails, removeMember } from "@/features/teams/api";
import type { Team, TeamBrief, TeamMember } from "@/features/teams/types";
import { useTeamStars } from "@/features/teams/starStore";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";
import type { AxiosError } from "axios";

/* ------------------------ Segmented (Boards-like) pills ------------------------ */
function SegmentedFilters<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
      {items.map(({ key, label }) => {
        const active = key === value;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={[
              "cursor-pointer rounded-lg px-4 py-2 text-sm transition",
              active
                ? "bg-white text-zinc-900 ring-2 ring-cyan-200 shadow-[0_0_0_3px_rgba(34,211,238,.20)]"
                : "text-zinc-600 hover:text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- Search --------------------------------- */
function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder ?? "Search…"}
        className="pl-9 pr-3"
        rounded="lg"
      />
    </div>
  );
}

/* ----------------------- Small outside-click hook ----------------------- */
function useOnClickOutside<T extends HTMLElement>(cb: () => void) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) cb();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [cb]);
  return ref;
}

/* ---------- Helpers ---------- */
type MaybeId = string | number | undefined;
const sameId = (a: MaybeId, b: MaybeId) => a != null && b != null && String(a) === String(b);

type MaybeMember = { id: number } & Partial<{
  user_id: number | string;
  role: "owner" | "manager" | "developer" | string;
}>;

function teamHasOwner(team: TeamBrief, userId: MaybeId): boolean {
  if (userId == null) return false;
  const members = (team.members ?? []) as unknown as MaybeMember[];
  return members.some((m) => sameId(m.user_id, userId) && m.role === "owner");
}

/* ------------------------------- Lightweight Modal ------------------------------- */
function ModalBase({
  open,
  onClose,
  children,
  widthClass = "w-[520px]",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative mx-3 rounded-2xl bg-white p-5 shadow-xl ${widthClass}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- Generic Confirm Dialog ----------------------------- */
function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  confirmTone = "danger",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmTone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmCls =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-500"
      : "bg-cyan-500 hover:bg-cyan-500/90";

  return (
    <ModalBase open={open} onClose={onCancel}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-rose-100">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <p className="mt-1 text-[15px] leading-6 text-zinc-600 text-justify">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="cursor-pointer rounded-lg px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white ${confirmCls}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

/* ----------------------------- Info (Cannot Delete) ----------------------------- */
function InfoDialog({
  open,
  title,
  message,
  onOk,
}: {
  open: boolean;
  title: string;
  message: string;
  onOk: () => void;
}) {
  return (
    <ModalBase open={open} onClose={onOk}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full bg-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <p className="mt-1 text-[15px] leading-6 text-zinc-600 text-justify">{message}</p>
          <div className="mt-4 flex justify-end">
            <button
              className="cursor-pointer rounded-lg bg-cyan-500 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500/90"
              onClick={onOk}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}

/* -------------------------------- Team card UI -------------------------------- */
type TeamCardProps = {
  t: TeamBrief;
  starred: boolean;
  onToggleStar: (id: number) => void;
  onEdit: (teamId: number) => void;
  onLeaveOrDelete: (teamId: number, name: string) => void;
  onMembers: (teamId: number) => void;
};

function TeamCard({
  t,
  starred,
  onToggleStar,
  onEdit,
  onLeaveOrDelete,
  onMembers,
}: TeamCardProps) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = useOnClickOutside<HTMLDivElement>(() => setMenuOpen(false));

  const isOwner = React.useMemo(() => teamHasOwner(t, user?.id), [t, user?.id]);

  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-[rgb(34,211,238)]">
      {/* Star */}
      <button
        onClick={() => onToggleStar(t.id)}
        className="absolute right-2 top-2 inline-grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow ring-1 ring-zinc-200 transition hover:bg-white cursor-pointer"
        title={starred ? "Unstar" : "Star"}
      >
        {starred ? (
          <Star className="h-4 w-4" style={{ color: "rgb(34,211,238)" }} />
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
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border bg-white p-1 shadow-lg">
              {/* Edit samo za ownere */}
              {isOwner && (
                <button
                  className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(t.id);
                  }}
                >
                  Edit
                </button>
              )}
              <button
                className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                onClick={() => {
                  setMenuOpen(false);
                  onLeaveOrDelete(t.id, t.name);
                }}
              >
                {isOwner ? "Delete team" : "Leave team"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* avatar + text */}
      <div className="grid h-full grid-rows-[auto_1fr_auto]">
        <div className="grid place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-900/90 text-white shadow-md">
            {t.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-zinc-900">{t.name}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <button
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-zinc-100 cursor-pointer"
            onClick={() => onMembers(t.id)}
          >
            <Users className="h-4 w-4" />
            Members: {t.members?.length ?? 0}
          </button>
          <span className="px-2 py-1" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Create card UI ------------------------------- */
function CreateTeamCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="
        flex h-48 w-full cursor-pointer flex-col items-center justify-center
        rounded-xl border-2 border-dashed border-cyan-200 bg-zinc-50
        text-zinc-600 transition hover:bg-zinc-100
      "
      onClick={onClick}
    >
      <span className="text-[15px] font-medium">+ Create team</span>
    </button>
  );
}

/* ================================== VIEW ================================== */
type FilterKey = "all" | "mine" | "starred";

export default function TeamsView() {
  const { data, loading, error, setData } = useTeamsMe();
  const { user } = useAuth();

  // local-only stars
  const { isStarred, toggleStar } = useTeamStars();

  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const [membersOpen, setMembersOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  // delete dialogs (owner)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [confirmTeamId, setConfirmTeamId] = React.useState<number | null>(null);
  const [confirmTeamName, setConfirmTeamName] = React.useState<string>("");

  // leave dialogs (non-owner)
  const [confirmLeaveOpen, setConfirmLeaveOpen] = React.useState(false);
  const [leaveTeamId, setLeaveTeamId] = React.useState<number | null>(null);
  const [leaveTeamName, setLeaveTeamName] = React.useState<string>("");

  // info for 409
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [infoMsg, setInfoMsg] = React.useState<string>("");

  const filtered: TeamBrief[] = React.useMemo(() => {
    const arr = data ?? [];
    const qq = q.trim().toLowerCase();

    let base = arr;
    if (filter === "starred") {
      base = arr.filter((t) => isStarred(t.id));
    } else if (filter === "mine") {
      base = arr.filter((t) => teamHasOwner(t, user?.id));
    }

    if (!qq) return base;
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(qq) ||
        (t.description ?? "").toLowerCase().includes(qq)
    );
  }, [data, q, filter, isStarred, user?.id]);

  async function openMembers(teamId: number) {
    const full = await getTeamDetails(teamId);
    setSelectedTeam(full);
    setMembersOpen(true);
  }

  // Kebab handler — odlučuje da li ide Delete (owner) ili Leave (member)
  function onLeaveOrDelete(teamId: number, name: string) {
    const team = (data ?? []).find((t) => t.id === teamId);
    const isOwner = team ? teamHasOwner(team, user?.id) : false;

    if (isOwner) {
      setConfirmTeamId(teamId);
      setConfirmTeamName(name);
      setConfirmDeleteOpen(true);
      return;
    }

    setLeaveTeamId(teamId);
    setLeaveTeamName(name);
    setConfirmLeaveOpen(true);
  }

  // Potvrđeno brisanje tima (owner)
  const confirmDeleteNow = React.useCallback(async () => {
    setConfirmDeleteOpen(false);
    if (confirmTeamId == null) return;

    const teamId = confirmTeamId;
    const teamBefore = (data ?? []).find((t) => t.id === teamId) ?? null;

    // optimistic remove
    setData((prev) => (prev ? prev.filter((t) => t.id !== teamId) : prev));

    try {
      await deleteTeamAction(teamId);
      toast.success(`Team “${confirmTeamName}” deleted.`);
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      const status = ax.response?.status ?? 0;

      // rollback
      if (teamBefore) {
        setData((prev) => (prev ? [teamBefore, ...prev].sort((a, b) => a.id - b.id) : prev));
      }

      if (status === 409) {
        setInfoMsg(
          `Team “${confirmTeamName}” can’t be deleted because there are boards
linked to it. Please transfer or delete all boards owned by this team first, then try again.`
        );
        setInfoOpen(true);
      } else {
        toast.error("Failed to delete team.");
      }
    }
  }, [confirmTeamId, confirmTeamName, data, setData]);

  // Potvrđeno napuštanje tima (non-owner)
  const confirmLeaveNow = React.useCallback(async () => {
    setConfirmLeaveOpen(false);
    if (leaveTeamId == null || user?.id == null) return;

    const teamId = leaveTeamId;
    const teamBefore = (data ?? []).find((t) => t.id === teamId) ?? null;

    // optimistic remove
    setData((prev) => (prev ? prev.filter((t) => t.id !== teamId) : prev));

    try {
      const uid = String(user.id);
      await toast.promise(removeMember(teamId, uid), {
        loading: "Leaving team…",
        success: `You left “${leaveTeamName}”.`,
        error: "Failed to leave team.",
      });
    } catch {
      // rollback
      if (teamBefore) {
        setData((prev) => (prev ? [teamBefore, ...prev].sort((a, b) => a.id - b.id) : prev));
      }
    }
  }, [leaveTeamId, leaveTeamName, data, setData, user?.id]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 pt-2 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Teams</h1>
          <p className="text-sm text-zinc-500">
            All your teams in one place. Create a team and invite members.
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <SearchField value={q} onChange={setQ} placeholder="Search teams..." />
        <div className="hidden sm:block">
          <SegmentedFilters
            value={filter}
            onChange={setFilter}
            items={[
              { key: "all", label: "All" },
              { key: "mine", label: "My teams" },
              { key: "starred", label: "Starred" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTeamCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-rose-600">Failed to load teams. Check console.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <CreateTeamCard onClick={() => setCreateOpen(true)} />

          {filtered.map((t) => (
            <TeamCard
              key={t.id}
              t={t}
              starred={isStarred(t.id)}
              onToggleStar={toggleStar}
              onEdit={async (id) => {
                const full = await getTeamDetails(id);
                setSelectedTeam(full);
                setEditOpen(true);
              }}
              onLeaveOrDelete={onLeaveOrDelete}
              onMembers={openMembers}
            />
          ))}
        </div>
      )}

      {/* Members dialog */}
      {selectedTeam && (
        <TeamMembersDialog
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          team={selectedTeam}
          onMembersChanged={(members: TeamMember[]) => {
            const next: Team = { ...selectedTeam, members };
            setSelectedTeam(next);
            setData((prev) =>
              prev ? prev.map((tb) => (tb.id === next.id ? { ...tb } : tb)) : prev
            );
          }}
        />
      )}

      {/* Edit dialog */}
      {selectedTeam && (
        <EditTeamDialog
          team={selectedTeam}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onUpdated={(next) => {
            setSelectedTeam(next);
            setData((prev) =>
              prev
                ? prev.map((tb) =>
                    tb.id === next.id
                      ? {
                          ...tb,
                          name: next.name,
                          description: next.description ?? undefined,
                        }
                      : tb
                  )
                : prev
            );
          }}
        />
      )}

      {/* Create dialog */}
      <CreateTeamDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(team) => {
          setData((prev) =>
            prev ? [team as unknown as TeamBrief, ...prev] : [team as unknown as TeamBrief]
          );
        }}
      />

      {/* Confirm DELETE (owner) */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete team?"
        message={`You’re about to delete the team “${confirmTeamName}”. This action cannot be undone.`}
        confirmText="Delete team"
        confirmTone="danger"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteNow}
      />

      {/* Confirm LEAVE (non-owner) */}
      <ConfirmDialog
        open={confirmLeaveOpen}
        title="Leave team?"
        message={`You’re about to leave the team “${leaveTeamName}”. You will lose access to its boards and activity.`}
        confirmText="Leave team"
        confirmTone="danger"
        onCancel={() => setConfirmLeaveOpen(false)}
        onConfirm={confirmLeaveNow}
      />

      {/* Info dialog for 409 (delete blocked) */}
      <InfoDialog
        open={infoOpen}
        title="Cannot delete team"
        message={infoMsg}
        onOk={() => setInfoOpen(false)}
      />
    </div>
  );
}
