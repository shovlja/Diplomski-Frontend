import * as React from "react";
import UsersToolbar from "@/components/ui/users/UsersToolbar";
import UsersTable from "@/components/ui/users/UsersTable";
import SkeletonTable from "@/components/ui/users/SkeletonTable";
import EmptyState from "@/components/ui/users/EmptyState";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { useAuth } from "@/features/auth/AuthContext";
import type { StatusFilter, UsersSort, UserRecord } from "@/features/users/types";

export default function AdminUsersView() {
  const { users, isLoading, toggleActive, removeUser } = useUsersQuery();
  const { user: authUser } = useAuth();

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [sort, setSort] = React.useState<UsersSort>("created_desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(7);

  const filtered = React.useMemo<UserRecord[] | null>(() => {
    if (!users) return null;

    // prikaži samo USER rolu i sakrij trenutno ulogovanog (admin)
    let arr = users.filter((u) => u.system_role === "USER" && u.id !== authUser?.id);

    if (q.trim()) {
      const qq = q.toLowerCase();
      arr = arr.filter(
        (u) =>
          u.display_name.toLowerCase().includes(qq) ||
          u.email.toLowerCase().includes(qq)
      );
    }

    if (status !== "all") {
      arr = arr.filter((u) => (status === "active" ? u.is_active : !u.is_active));
    }

    arr.sort((a, b) => {
      switch (sort) {
        case "created_desc":
          return +new Date(b.created_at) - +new Date(a.created_at);
        case "created_asc":
          return +new Date(a.created_at) - +new Date(b.created_at);
        case "name_asc":
          return a.display_name.localeCompare(b.display_name);
        case "name_desc":
          return b.display_name.localeCompare(a.display_name);
        case "email_asc":
          return a.email.localeCompare(b.email);
        case "email_desc":
          return b.email.localeCompare(a.email);
        default:
          return 0;
      }
    });

    return arr;
  }, [users, q, status, sort, authUser?.id]);

  React.useEffect(() => {
    setPage(1);
  }, [q, status, sort, pageSize]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
      <div className="pt-2 pb-3">
        <h1 className="text-xl font-semibold text-zinc-900">All users</h1>
        <p className="text-sm text-zinc-500">Manage accounts, roles and access.</p>
      </div>

      <UsersToolbar
        q={q}
        setQ={setQ}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
      />

      {/* Rows selektor poravnat sa širinom tabele */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <span className="text-sm text-zinc-600">Rows</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none"
        >
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : filtered && filtered.length > 0 ? (
        <UsersTable
          users={filtered}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          onToggleActive={toggleActive}
          onPromoteDemote={() => {}}
          onRemove={removeUser}
          showRoleAction={false}
        />
      ) : (
        <EmptyState />
      )}

      <div className="h-8" />
    </div>
  );
}
