// src/components/ui/notifications/NotificationItem.tsx
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/features/notifications/types";
import { timeAgo } from "@/features/notifications/time";

/* Simple avatar with initials (for accepted/left/invite) */
function initials(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type Props = {
  data: Notification & { __accepted?: boolean };
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
};

export default function NotificationItem({ data, onAccept, onDecline }: Props) {
  const when = timeAgo(data.created_at);

  // Optimistic "joined" for team_invite after Accept
  if (data.kind === "team_invite" && data.__accepted) {
    const { team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] text-zinc-800">
            You have joined the team <span className="font-semibold">{team_name}</span>.
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  // Team invite (avatar + inline buttons + time at far right)
  if (data.kind === "team_invite") {
    const { inviter_name, team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left: avatar + text + actions all in one row */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900/90 text-xs font-semibold text-white">
              {initials(inviter_name)}
            </div>
            <p className="truncate text-[15px] text-zinc-800">
              <span className="font-semibold">{inviter_name}</span> has invited you to join the
              team <span className="font-semibold">{team_name}</span>.
            </p>

            {/* actions inline with the text */}
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <Button className="h-8 rounded-md px-3" onClick={() => onAccept(data.id)}>
                Accept
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-md px-3 hover:bg-rose-50"
                onClick={() => onDecline(data.id)}
              >
                Decline
              </Button>
            </div>
          </div>

          {/* time – remains at far right in the same row */}
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  if (data.kind === "team_joined") {
    const { team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] text-zinc-800">
            You have joined the team <span className="font-semibold">{team_name}</span>.
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  if (data.kind === "team_kicked") {
    const { team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] text-zinc-800">
            You've been kicked from team <span className="font-semibold">{team_name}</span>.
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  if (data.kind === "team_role_changed") {
    const { team_name, role } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] text-zinc-800">
            Your role in team <span className="font-semibold">{team_name}</span> is now{" "}
            <span className="font-semibold">
              {role === "manager" ? "Manager" : role === "owner" ? "Owner" : "Developer"}
            </span>
            .
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  if (data.kind === "invite_accepted") {
    const { actor_display_name, actor_avatar_url, team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900/90 text-xs font-semibold text-white">
              {actor_avatar_url ? (
                <img
                  src={actor_avatar_url}
                  alt={actor_display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(actor_display_name)
              )}
            </div>
            <p className="truncate text-[15px] text-zinc-800">
              <span className="font-semibold">{actor_display_name}</span> has accepted your invite to
              join the team <span className="font-semibold">{team_name}</span>.
            </p>
          </div>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  if (data.kind === "member_left") {
    const { actor_display_name, actor_avatar_url, team_name } = data.payload;
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-900/90 text-xs font-semibold text-white">
              {actor_avatar_url ? (
                <img
                  src={actor_avatar_url}
                  alt={actor_display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(actor_display_name)
              )}
            </div>
            <p className="truncate text-[15px] text-zinc-800">
              <span className="font-semibold">{actor_display_name}</span> has left the team{" "}
              <span className="font-semibold">{team_name}</span>.
            </p>
          </div>
          <span className="shrink-0 text-xs text-zinc-500">{when}</span>
        </div>
      </div>
    );
  }

  return null;
}
