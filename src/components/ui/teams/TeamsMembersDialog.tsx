import * as React from "react";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/features/auth/AuthContext";
import type { Team, TeamMember, TeamRole } from "@/features/teams/types";
import {
  changeMemberRole,
  removeMember,
  inviteByEmail,
  searchUsers,
} from "@/features/teams/api";
import { toast } from "sonner";

/* --------------------------------- helpers --------------------------------- */
function initials(displayName?: string | null) {
  const name = (displayName ?? "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function RoleBadge({ role }: { role: TeamRole }) {
  const label =
    role === "owner" ? "Owner" : role === "manager" ? "Manager" : "Developer";
  const tone =
    role === "owner"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : role === "manager"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-zinc-100 text-zinc-700 ring-zinc-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  team: Team;
  onMembersChanged: (members: TeamMember[]) => void;
};

type SuggestUser = {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string | null;
};
type SelectedInvite = {
  email: string;
  display_name?: string;
  source?: "typed" | "suggestion";
};

/* --- Guardovi bez any --- */
type LooseUser = {
  id?: number | string;
  display_name?: string | null | undefined;
};
type LooseMember = TeamMember &
  Partial<{ user_id: number | string; user: LooseUser }>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}
function isFiniteNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Vraća **string** userId (UUID ili broj kao string). Nikad ne vraća "NaN". */
function getUserIdStrSafe(member: LooseMember): string | null {
  const candidates: unknown[] = [member.user_id, member.user?.id];

  for (const c of candidates) {
    if (isNonEmptyString(c)) {
      const s = c.trim();
      if (UUID_REGEX.test(s)) return s; // UUID OK
      if (s.toLowerCase() !== "nan" && s.toLowerCase() !== "undefined") return s; // fallback
    }
    if (isFiniteNumber(c)) {
      return String(c);
    }
  }
  return null;
}

export default function TeamsMembersDialog({
  open,
  onClose,
  team,
  onMembersChanged,
}: Props) {
  const { user } = useAuth();
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  // KOJI "kebab" meni je otvoren (samo jedan istovremeno)
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const myMembership = React.useMemo(
    () => team.members.find((m) => m.user_id === user?.id),
    [team.members, user?.id]
  );
  const myRole: TeamRole | null = myMembership?.role ?? null;
  const canInvite = myRole === "owner" || myRole === "manager";

  const memberIds = React.useMemo(
    () => new Set(team.members.map((m) => String(m.user_id))),
    [team.members]
  );

  /* --------------------------- INVITE (multi-select) --------------------------- */
  const [inviteQuery, setInviteQuery] = React.useState("");
  const [suggest, setSuggest] = React.useState<SuggestUser[]>([]);
  const [selected, setSelected] = React.useState<SelectedInvite[]>([]);
  const [inviting, setInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setInviteQuery("");
      setSuggest([]);
      setSelected([]);
      setInviteError(null);
      setInviteInfo(null);
      setOpenMenuId(null);
    }
  }, [open, team.id]);

  React.useEffect(() => {
    if (!canInvite) {
      setSuggest([]);
      return;
    }
    let cancelled = false;
    const q = inviteQuery.trim();
    if (!q || q.length < 2) {
      setSuggest([]);
      return;
    }
    (async () => {
      try {
        const arr = await searchUsers(q, 5);
        const selectedEmails = new Set(
          selected.map((s) => s.email.toLowerCase())
        );
        const filtered = arr.filter(
          (u) =>
            !memberIds.has(String(u.id)) &&
            !selectedEmails.has(u.email.toLowerCase())
        );
        if (!cancelled) setSuggest(filtered);
      } catch {
        if (!cancelled) setSuggest([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteQuery, canInvite, memberIds, selected]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Klik bilo gde u dijalogu (mimo menija/dugmeta) zatvara otvoreni meni
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const handleAnyClickCapture = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.target as Element;
      const insideMenu = el.closest("[data-menu-root]");
      const menuBtn = el.closest("[data-menu-btn]");
      if (!insideMenu && !menuBtn) {
        if (openMenuId !== null) setOpenMenuId(null);
      }
    },
    [openMenuId]
  );

  /* --------------------------------- Roles ---------------------------------- */
  async function setRole(member: TeamMember, role: Exclude<TeamRole, "owner">) {
    if (myRole !== "owner") return;
    if (member.role === "owner") return;

    const uid = getUserIdStrSafe(member as LooseMember);
    if (!uid) {
      console.warn("Cannot determine user id for member", member);
      toast.error("Cannot determine user id for this member");
      return;
    }

    const prevRole = member.role;
    onMembersChanged(
      team.members.map((m) => (m.id === member.id ? { ...m, role } : m))
    ); // optimistic
    setOpenMenuId(null);

    try {
      await toast.promise(
        changeMemberRole(
          team.id,
          uid,
          role === "manager" ? "manager" : "developer"
        ),
        {
          loading: "Updating role…",
          success: "Role updated.",
          error: "Failed to update role.",
        }
      );
    } catch {
      onMembersChanged(
        team.members.map((m) =>
          m.id === member.id ? { ...m, role: prevRole } : m
        )
      ); // rollback
    }
  }

  async function kick(member: TeamMember) {
    if (myRole !== "owner") return;
    if (member.role === "owner") return;

    const uid = getUserIdStrSafe(member as LooseMember);
    if (!uid) {
      console.warn("Cannot determine user id for member", member);
      toast.error("Cannot determine user id for this member");
      return;
    }

    const prev = team.members;
    onMembersChanged(prev.filter((m) => m.id !== member.id)); // optimistic
    setOpenMenuId(null);

    try {
      await toast.promise(removeMember(team.id, uid), {
        loading: "Removing member…",
        success: "Member removed.",
        error: "Failed to remove member.",
      });
    } catch {
      onMembersChanged(prev); // rollback
    }
  }

  async function leave() {
    if (!myMembership || !user?.id) return;

    const prev = team.members;
    onMembersChanged(prev.filter((m) => m.id !== myMembership.id)); // optimistic
    setOpenMenuId(null);
    onClose();

    try {
      await toast.promise(removeMember(team.id, String(user.id)), {
        loading: "Leaving team…",
        success: "You left the team.",
        error: "Failed to leave team.",
      });
    } catch {
      onMembersChanged(prev); // rollback
    }
  }

  /* ------------------------ Multi-select invite ------------------------ */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  function addSelected(item: SelectedInvite) {
    setSelected((prev) => {
      const exists = prev.some(
        (s) => s.email.toLowerCase() === item.email.toLowerCase()
      );
      return exists ? prev : [...prev, item];
    });
  }
  function handlePickSuggestion(u: SuggestUser) {
    addSelected({
      email: u.email,
      display_name: u.display_name,
      source: "suggestion",
    });
    setInviteQuery("");
    setSuggest((prev) =>
      prev.filter((x) => x.email.toLowerCase() !== u.email.toLowerCase())
    );
  }
  function handleRemoveChip(email: string) {
    setSelected((prev) =>
      prev.filter((s) => s.email.toLowerCase() !== email.toLowerCase())
    );
  }
  function tryAddTypedTokens() {
    const tokens = inviteQuery
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    let added = 0;
    tokens.forEach((t) => {
      if (emailRegex.test(t)) {
        addSelected({ email: t, source: "typed" });
        added++;
      }
    });
    if (added > 0) setInviteQuery("");
  }
  function onInviteKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      tryAddTypedTokens();
    }
  }
  function extractErrorMessage(err: unknown): string {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const maybe = err as { response?: { data?: { detail?: unknown } } };
      const detail = maybe.response?.data?.detail;
      if (typeof detail === "string") return detail;
    }
    return (err as Error)?.message ?? "Failed to send invite";
  }
  async function invite() {
    if (!canInvite) return;
    tryAddTypedTokens();
    if (selected.length === 0) return;

    setInviting(true);
    setInviteError(null);
    setInviteInfo(null);

    const emails = selected.map((s) => s.email);
    const loadingId = toast.loading(`Sending ${emails.length} invite(s)…`);

    const reqs = emails.map((e) => inviteByEmail(team.id, e));
    const results = await Promise.allSettled(reqs);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const fail = results.length - ok;

    toast.dismiss(loadingId);
    if (fail === 0) {
      toast.success(`Sent ${ok}/${results.length} invite(s).`);
      setInviteInfo("Invitations sent (or already pending).");
    } else if (ok === 0) {
      toast.error("Failed to send invites.");
      setInviteError("Failed to send invites.");
    } else {
      toast.warning(`Partially sent: ${ok}/${results.length}.`);
      const firstErr = results.find(
        (r) => r.status === "rejected"
      ) as PromiseRejectedResult | undefined;
      if (firstErr?.reason) setInviteError(extractErrorMessage(firstErr.reason));
    }

    setSelected([]);
    setInviting(false);
  }

  React.useEffect(() => {
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        // prvo zatvori otvoreni meni, pa ako nema – zatvori dijalog
        if (openMenuId !== null) setOpenMenuId(null);
        else onClose();
      }
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, openMenuId, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
    >
      <div
        ref={containerRef}
        onMouseDownCapture={handleAnyClickCapture}
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-zinc-900">Team members</h2>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {team.members.map((m) => {
            const isMe = m.user_id === user?.id;
            const canOwnerTouch = myRole === "owner" && m.role !== "owner";
            const name =
              m.user?.display_name ??
              (isMe ? user?.display_name ?? "You" : `User ${String(m.user_id).slice(0, 8)}`);

            const actions: "manage" | "leave" | null = canOwnerTouch
              ? "manage"
              : isMe
              ? "leave"
              : null;

            const isMenuOpen = openMenuId === m.id;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-900/90 text-white">
                    {initials(name)}
                  </div>
                  <div className="text-[15px] font-medium text-zinc-900">
                    {name}
                  </div>
                </div>

                <div className="relative flex items-center gap-3">
                  <RoleBadge role={m.role} />

                  {actions && (
                    <div className="relative" data-menu-root={isMenuOpen ? "1" : undefined}>
                      <button
                        data-menu-btn
                        className="list-none rounded-full p-1 transition hover:bg-zinc-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === m.id ? null : m.id));
                        }}
                        aria-label="Open member actions"
                      >
                        <MoreHorizontal className="h-5 w-5 text-zinc-700" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-52 rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl">
                          {actions === "manage" ? (
                            <>
                              {m.role !== "manager" && (
                                <button
                                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 cursor-pointer"
                                  onClick={() => setRole(m, "manager")}
                                >
                                  Set as manager
                                </button>
                              )}
                              {m.role !== "developer" && (
                                <button
                                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-50 cursor-pointer"
                                  onClick={() => setRole(m, "developer")}
                                >
                                  Set as member
                                </button>
                              )}
                              <button
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                                onClick={() => kick(m)}
                              >
                                Kick member
                              </button>
                            </>
                          ) : (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 cursor-pointer"
                              onClick={leave}
                            >
                              Leave team
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite people */}
        {canInvite && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium text-zinc-800">Invite people</h3>

            <div className="mb-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
              {selected.length === 0 ? (
                <div className="px-1 py-2 text-xs text-zinc-500">
                  No recipients selected yet.
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {selected.map((s) => (
                    <span
                      key={s.email}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800"
                    >
                      {s.display_name ? `${s.display_name} – ${s.email}` : s.email}
                      <button
                        className="rounded-full p-0.5 hover:bg-zinc-200 cursor-pointer"
                        onClick={() => handleRemoveChip(s.email)}
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                value={inviteQuery}
                onChange={(e) => setInviteQuery(e.target.value)}
                onKeyDown={onInviteKeyDown}
                placeholder="Type emails, press Enter…"
                rounded="xl"
              />
              {suggest.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
                  {suggest.map((u) => (
                    <button
                      key={u.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                      onClick={() => handlePickSuggestion(u)}
                      type="button"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900/90 text-white text-xs">
                        {initials(u.display_name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-900">
                          {u.display_name}
                        </div>
                        <div className="truncate text-xs text-zinc-500">{u.email}</div>
                      </div>
                      <div className="ml-auto text-xs text-zinc-500">Add</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                className="h-10 rounded-xl px-5"
                onClick={invite}
                disabled={inviting || (inviteQuery.trim() === "" && selected.length === 0)}
              >
                {inviting
                  ? "Inviting…"
                  : selected.length > 0
                  ? `Invite ${selected.length}`
                  : "Invite"}
              </Button>
              <span className="text-xs text-zinc-500">
                You can paste multiple emails separated by comma or space.
              </span>
            </div>

            {inviteError && (
              <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {inviteError}
              </div>
            )}
            {inviteInfo && !inviteError && (
              <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {inviteInfo}
              </div>
            )}

            <div className="mt-3 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Tip: invites are sent immediately. Members will appear after they accept the
              invitation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
