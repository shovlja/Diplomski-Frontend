import * as React from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { StatusFilter, UsersSort } from "@/features/users/types";

type Props = {
  q: string;
  setQ: (v: string) => void;

  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;

  sort: UsersSort;
  setSort: (s: UsersSort) => void;
};

export default function UsersToolbar({
  q,
  setQ,
  status,
  setStatus,
  sort,
  setSort,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT: search */}
      <div className="relative w-full sm:max-w-[540px]">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-2 text-[15px] outline-none ring-0 focus:border-cyan-400"
        />
      </div>

      {/* RIGHT: status chips + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-1">
          {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={[
                "rounded-md px-3 py-1.5 text-sm transition",
                status === s
                  ? "bg-cyan-100 text-cyan-700"
                  : "text-zinc-700 hover:bg-zinc-100",
              ].join(" ")}
            >
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1">
          <span className="text-sm text-zinc-600">Created</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as UsersSort)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none"
          >
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="email_asc">Email (A–Z)</option>
            <option value="email_desc">Email (Z–A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
