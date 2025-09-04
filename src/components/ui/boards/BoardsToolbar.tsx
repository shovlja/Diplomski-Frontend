import * as React from "react";
import { SortAsc, SortDesc, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { TOKENS } from "@/lib/tokens";
import type { FilterKind, SortKind } from "@/features/boards/types";

type Props = {
  q: string;
  setQ: (v: string) => void;
  filter: FilterKind;
  setFilter: (v: FilterKind) => void;
  sort: SortKind;
  setSort: (v: SortKind) => void;
  rightSlot?: React.ReactNode; // za "New board" dugme kad zatreba
};

export default function BoardsToolbar({ q, setQ, filter, setFilter, sort, setSort, rightSlot }: Props) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search boards..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-1 gap-1">
            {(["all", "mine", "starred"] as FilterKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={[
                  "rounded-md px-3 py-1.5 text-sm transition",
                  filter === k ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50",
                ].join(" ")}
                style={filter === k ? { outline: `2px solid ${TOKENS.ring}` } : {}}
              >
                {k === "all" ? "All" : k === "mine" ? "My boards" : "Starred"}
              </button>
            ))}
          </div>

          <div className="ml-auto inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
            <span className="text-sm text-zinc-600">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKind)} className="bg-transparent text-sm text-zinc-900 outline-none">
              <option value="activity_desc">Last activity (newest)</option>
              <option value="activity_asc">Last activity (oldest)</option>
              <option value="title_asc">Title (A–Z)</option>
              <option value="title_desc">Title (Z–A)</option>
            </select>
            {sort === "activity_asc" || sort === "title_asc" ? (
              <SortAsc className="h-4 w-4 text-zinc-500" />
            ) : (
              <SortDesc className="h-4 w-4 text-zinc-500" />
            )}
          </div>

          {rightSlot}
        </div>
      </div>
    </div>
  );
}
