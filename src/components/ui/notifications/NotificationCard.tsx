// src/components/ui/notifications/NotificationCard.tsx
import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/features/notifications/types";
import { timeAgo, initials } from "@/features/notifications/time";

/** Lokalno proširenje – marker da je pozivnica prihvaćena */
type LocalNotification = Notification & { __accepted?: boolean };

type Props = {
  notification: LocalNotification;
  onAccept: (n: LocalNotification) => void | Promise<void>;
  onDecline: (n: LocalNotification) => void | Promise<void>;
};

export default function NotificationCard({ notification: n, onAccept, onDecline }: Props) {
  const accepted = !!n.__accepted;
  const rel = timeAgo(n.created_at);

  const isInvite = n.kind === "team_invite" && !accepted;

  const teamName =
    n.kind === "team_invite"
      ? n.payload.team_name
      : n.kind === "team_joined"
      ? n.payload.team_name
      : n.kind === "team_kicked"
      ? n.payload.team_name
      : n.kind === "team_role_changed"
      ? n.payload.team_name
      : "";

  const inviterName = n.kind === "team_invite" ? n.payload.inviter_name || "Someone" : "";

  function renderText() {
    switch (n.kind) {
      case "team_invite":
        if (!accepted) {
          return (
            <>
              <span className="font-semibold text-zinc-900">{inviterName}</span>{" "}
              has invited you to join the team{" "}
              <span className="font-semibold text-zinc-900">{teamName}</span>.
            </>
          );
        }
        // fallthrough to joined text after accept
      case "team_joined":
        return (
          <>
            You have joined the team{" "}
            <span className="font-semibold text-zinc-900">{teamName}</span>.
          </>
        );
      case "team_kicked":
        return (
          <>
            You&apos;ve been kicked from team{" "}
            <span className="font-semibold text-zinc-900">{teamName}</span>.
          </>
        );
      case "team_role_changed":
        return (
          <>
            Your role in team{" "}
            <span className="font-semibold text-zinc-900">{teamName}</span>{" "}
            is now{" "}
            <span className="font-semibold text-zinc-900">
              {n.payload.role.charAt(0).toUpperCase() + n.payload.role.slice(1)}
            </span>.
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        {isInvite && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900/90 text-xs font-semibold text-white">
            {initials(inviterName)}
          </div>
        )}

        <div className="flex min-w-0 items-center gap-3">
          <div className="truncate text-[15px] text-zinc-700">{renderText()}</div>

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

      <div className="ml-3 flex-none text-xs text-zinc-400">{rel}</div>
    </div>
  );
}
