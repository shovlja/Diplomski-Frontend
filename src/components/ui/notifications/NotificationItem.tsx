import * as React from "react";
import { Button } from "@/components/ui/Button";
import type { Notification } from "@/features/notifications/types";
import { timeAgo } from "@/features/notifications/time";

type Props = {
  data: Notification;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
};

export default function NotificationItem({ data, onAccept, onDecline }: Props) {
  if (data.kind === "team_invite") {
    const { inviter_name, team_name } = data.payload;

    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-[15px] text-zinc-800">
            <span className="font-semibold">{inviter_name}</span> has invited you to join the team{" "}
            <span className="font-semibold">{team_name}</span>.
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{timeAgo(data.created_at)}</span>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            className="h-8 rounded-md px-3"
            onClick={() => onAccept(data.id)}
          >
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
    );
  }

  // fallback (teoretski nedostižno sa trenutnim tipovima)
  return null;
}
