import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/features/auth/AuthContext";
import type { Team, TeamMember, TeamRole } from "@/features/teams/types";
import { changeMemberRole, removeMember, inviteByEmail, searchUsers } from "@/features/teams/api";

/* --------------------------------- helpers --------------------------------- */
function initials(displayName?: string | null) {
  const name = (displayName ?? "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function RoleBadge({ role }: { role: TeamRole }) {
  const label = role === "owner" ? "Owner" : role === "manager" ? "Manager" : "User";
  const tone =
    role === "owner"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : role === "manager"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-zinc-100 text-zinc-700 ring-zinc-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}>
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

export default function TeamsMembersDialog({ open, onClose, team, onMembersChanged }: Props) {
  const { user } = useAuth();
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  const myMembership = React.useMemo(
    () => team.members.find((m) => m.user_id === user?.id),
    [team.members, user?.id]
  );
  const myRole: TeamRole | null = myMembership?.role ?? null;

  // invite
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [suggest, setSuggest] = React.useState<
    { id: string; display_name: string; email: string; avatar_url?: string | null }[]
  >([]);
  const [inviting, setInviting] = React.useState(false);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = React.useState<string | null>(null);

  // Reset polja kada se otvori ili promeni tim
  React.useEffect(() => {
    if (open) {
      setInviteEmail("");
      setSuggest([]);
      setInviteError(null);
      setInviteInfo(null);
    }
  }, [open, team.id]);

  // Sugestije
  React.useEffect(() => {
    let cancelled = false;
    const q = inviteEmail.trim();
    if (!q || q.length < 2) {
      setSuggest([]);
      return;
    }
    (async () => {
      try {
        const arr = await searchUsers(q, 5);
        if (!cancelled) setSuggest(arr);
      } catch {
        if (!cancelled) setSuggest([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteEmail]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function setRole(member: TeamMember, role: Exclude<TeamRole, "owner">) {
    if (myRole !== "owner") return;
    if (member.role === "owner") return;
    await changeMemberRole(team.id, member.user_id, role);
    onMembersChanged(team.members.map((m) => (m.id === member.id ? { ...m, role } : m)));
  }

  async function kick(member: TeamMember) {
    if (myRole !== "owner") return;
    if (member.role === "owner") return;
    await removeMember(team.id, member.user_id);
    onMembersChanged(team.members.filter((m) => m.id !== member.id));
  }

  async function leave() {
    if (!myMembership) return;
    await removeMember(team.id, myMembership.user_id);
    onMembersChanged(team.members.filter((m) => m.id !== myMembership.id));
    onClose();
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
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    setInviteError(null);
    setInviteInfo(null);
    try {
      await inviteByEmail(team.id, email);
      setInviteEmail("");
      setSuggest([]);
      setInviteInfo("Invitation sent (or already pending).");
    } catch (err: unknown) {
      setInviteError(extractErrorMessage(err));
    } finally {
      setInviting(false);
    }
  }

  // Enter u polju šalje invite
  function onInviteKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !inviting && inviteEmail.trim()) {
      e.preventDefault();
      void invite();
    }
  }

  React.useEffect(() => {
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-zinc-900">Team members</h2>
        </div>

        <div className="space-y-3">
          {team.members.map((m) => {
            const isMe = m.user_id === user?.id;
            const canOwnerTouch = myRole === "owner" && m.role !== "owner";
            const name =
              m.user?.display_name ??
              (isMe ? user?.display_name ?? "You" : `User ${m.user_id.slice(0, 8)}`);

            return (
              <div key={m.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-900/90 text-white">
                    {initials(name)}
                  </div>
                  <div className="text-[15px] font-medium text-zinc-900">{name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <RoleBadge role={m.role} />

                  <details className="relative">
                    <summary className="list-none rounded-full p-1 hover:bg-black/5 cursor-pointer">
                      <MoreHorizontal className="h-5 w-5" />
                    </summary>

                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg">
                      {canOwnerTouch ? (
                        <>
                          {m.role !== "manager" && (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                              onClick={() => setRole(m, "manager")}
                            >
                              Set as manager
                            </button>
                          )}
                          {m.role !== "developer" && (
                            <button
                              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                              onClick={() => setRole(m, "developer")}
                            >
                              Set as member
                            </button>
                          )}
                          <button
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                            onClick={() => kick(m)}
                          >
                            Kick member
                          </button>
                        </>
                      ) : isMe ? (
                        <button
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                          onClick={leave}
                        >
                          Leave team
                        </button>
                      ) : (
                        <div className="px-3 py-2 text-sm text-zinc-400">No actions</div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div className="relative grow">
              <Input
                placeholder="Invite by email…"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={onInviteKeyDown}
                rounded="xl"
              />
              {suggest.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
                  {suggest.map((u) => (
                    <button
                      key={u.id}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                      onClick={() => setInviteEmail(u.email)}
                      type="button"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900/90 text-white text-xs">
                        {initials(u.display_name)}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">{u.display_name}</div>
                        <div className="text-xs text-zinc-500">{u.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              className="h-11 rounded-xl px-5"
              onClick={invite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Inviting…" : "Invite"}
            </Button>
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
            Tip: invites are sent immediately. Members will appear after they accept the invitation.
          </div>
        </div>
      </div>
    </div>
  );
}
