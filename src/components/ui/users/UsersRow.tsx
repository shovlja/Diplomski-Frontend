import * as React from "react";
import type { UserRecord } from "@/features/users/types";
import { initials, formatDateLong } from "@/features/users/utils";
import { Button } from "@/components/ui/Button";

type Props = {
  user: UserRecord;
  onToggleActive: (id: string) => void;
  onPromoteDemote: (id: string) => void;
  onRemove: (id: string) => void;
  showRoleAction?: boolean;
};

function RoleChip({ role }: { role: UserRecord["system_role"] }) {
  const isAdmin = role === "ADMIN";
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-700">
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-300 bg-zinc-50 text-zinc-600",
      ].join(" ")}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function UsersRow({
  user,
  onToggleActive,
  onPromoteDemote,
  onRemove,
  showRoleAction = true,
}: Props) {
  return (
    <tr className="hover:bg-zinc-50">
      {/* USER */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="inline-grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-zinc-200 text-sm font-medium text-zinc-700">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(user.display_name)
            )}
          </div>
          <div>
            <div className="font-medium text-zinc-900">{user.display_name}</div>
            <div className="text-xs text-zinc-500">{user.email}</div>
          </div>
        </div>
      </td>

      {/* Role / Status / Created */}
      <td className="px-4 py-3 text-center">
        <RoleChip role={user.system_role} />
      </td>
      <td className="px-4 py-3 text-center">
        <StatusChip active={user.is_active} />
      </td>
      <td className="px-4 py-3 text-center text-sm text-zinc-600">
        {formatDateLong(user.created_at, "en-US")}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Button
            className="min-w-[108px] justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100"
            onClick={() => onToggleActive(user.id)}
          >
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>

          {showRoleAction && (
            <Button
              className="min-w-[112px] justify-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100"
              onClick={() => onPromoteDemote(user.id)}
            >
              {user.system_role === "ADMIN" ? "Make user" : "Make admin"}
            </Button>
          )}

          <Button
            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700"
            onClick={() => onRemove(user.id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}
