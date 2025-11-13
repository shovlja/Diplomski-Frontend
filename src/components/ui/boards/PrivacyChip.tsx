import * as React from "react";
import { Lock, Users as UsersIcon } from "lucide-react";
import type { BoardPrivacy } from "@/features/boards/types";

export default function PrivacyChip({ privacy }: { privacy: BoardPrivacy }) {
  if (privacy === "private") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-600">
        <Lock className="h-3.5 w-3.5" /> Private
      </span>
    );
  }
  if (privacy === "team") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-600">
        <UsersIcon className="h-3.5 w-3.5" /> Team
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-600">
      Public
    </span>
  );
}
