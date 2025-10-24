// src/components/ui/notifications/NotificationCard.tsx
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/features/notifications/types";
import { timeAgo, initials } from "@/features/notifications/time";

type Props = {
  notification: Notification;
  onAccept: (n: Notification) => void | Promise<void>;
  onDecline: (n: Notification) => void | Promise<void>;
};

export default function NotificationCard({ notification: n, onAccept, onDecline }: Props) {
  const isInvite = n.kind === "team_invite";
  const rel = timeAgo(n.created_at);

  // safe access to payload fields by kind
  const teamName =
    n.kind === "team_invite" ? n.payload.team_name : n.payload.team_name;
  const inviterName =
    n.kind === "team_invite" ? n.payload.inviter_name || "Someone" : "";

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      {/* Left side: avatar (only for invites) + text + actions (inline) */}
      <div className="flex min-w-0 items-center gap-3">
        {isInvite && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900/90 text-xs font-semibold text-white">
            {initials(inviterName)}
          </div>
        )}

        <div className="flex min-w-0 items-center gap-3">
          <div className="truncate text-[15px] text-zinc-700">
            {isInvite ? (
              <>
                <span className="font-semibold text-zinc-900">{inviterName}</span>{" "}
                has invited you to join the team{" "}
                <span className="font-semibold text-zinc-900">{teamName}</span>.
              </>
            ) : (
              <>
                You have joined the team{" "}
                <span className="font-semibold text-zinc-900">{teamName}</span>.
              </>
            )}
          </div>

          {isInvite && (
            <div className="flex flex-none items-center gap-2">
              <Button className="h-8 rounded-full px-4" onClick={() => onAccept(n)}>
                Accept
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-full px-4"
                onClick={() => onDecline(n)}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: time ago */}
      <div className="ml-3 flex-none text-xs text-zinc-400">{rel}</div>
    </div>
  );
}
