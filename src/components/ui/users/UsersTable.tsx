import * as React from "react";
import type { UserRecord } from "@/features/users/types";
import UsersRow from "./UsersRow";

type Props = {
  users: UserRecord[];
  page: number;
  setPage: (p: number) => void;
  pageSize?: number;
  onToggleActive: (id: string) => void;
  onPromoteDemote: (id: string) => void;
  onRemove: (id: string) => void;

  /** Fiksan broj redova koji određuje visinu viewporta (default 8) */
  fixedViewportRows?: number;
  rowPx?: number;
  headerPx?: number;

  /** Sakrij/Prikaži role akciju (“Make admin/Make user”) */
  showRoleAction?: boolean;
};

export default function UsersTable({
  users,
  page,
  setPage,
  pageSize = 10,
  onToggleActive,
  onPromoteDemote,
  onRemove,
  fixedViewportRows = 8,
  rowPx = 56,
  headerPx = 44,
  showRoleAction = true,
}: Props) {
  const total = users.length;

  const ps = Math.max(1, Number(pageSize) || 1);
  const currentPage = Math.max(1, Number(page) || 1);

  const start = (currentPage - 1) * ps;
  const end = Math.min(total, start + ps);
  const pageItems = users.slice(start, end);

  const pages = Math.max(1, Math.ceil(total / ps));
  const showingStart = total ? start + 1 : 0;
  const showingEnd = start + pageItems.length;

  const scrollStyle: React.CSSProperties = {
    height: `calc(${fixedViewportRows} * ${rowPx}px + ${headerPx}px)`,
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-y-auto" style={scrollStyle}>
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-[1] bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr className="border-b border-zinc-200">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="w-[110px] px-4 py-3 text-center font-medium">Role</th>
              <th className="w-[120px] px-4 py-3 text-center font-medium">Status</th>
              <th className="w-[160px] px-4 py-3 text-center font-medium">Created</th>
              <th className="w-[290px] px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pageItems.map((u) => (
              <UsersRow
                key={u.id}
                user={u}
                onToggleActive={onToggleActive}
                onPromoteDemote={onPromoteDemote}
                onRemove={onRemove}
                showRoleAction={showRoleAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-2 text-sm">
        <div className="text-zinc-600">
          Showing <strong>{showingStart}–{showingEnd}</strong> of <strong>{total}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Prev
          </button>
          <div className="text-zinc-600">Page {currentPage} / {pages}</div>
          <button
            className="rounded-md border border-zinc-200 px-3 py-1 hover:bg-zinc-50 disabled:opacity-50"
            disabled={currentPage >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
