import * as React from "react";
import type { SystemRole } from "@/features/users/types";

export default function RoleChip({ role }: { role: SystemRole }) {
  return (
    <span className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] text-zinc-700">
      {role === "ADMIN" ? "Admin" : "User"}
    </span>
  );
}
