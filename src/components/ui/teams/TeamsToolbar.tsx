import * as React from "react";
import { Search } from "lucide-react";
import Input from "@/components/ui/Input";

type Filter = "all" | "mine" | "starred";

type Props = {
  q: string;
  setQ: (v: string) => void;
  filter: Filter;
  setFilter: (v: Filter) => void;
};

export default function TeamsToolbar({ q, setQ, filter, setFilter }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search w/ icon — boards style */}
      <div className="relative w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams..."
          className="pl-9 pr-3"
          rounded="full"
        />
      </div>

      {/* Tabs (chips) */}
      <div className="inline-flex gap-1 rounded-full bg-zinc-100 p-1">
        {(["all", "mine", "starred"] as const).map((k) => {
          const active = filter === k;
          const label = k === "all" ? "All" : k === "mine" ? "My teams" : "Starred";
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={[
                "cursor-pointer rounded-full px-3 py-1.5 text-sm transition",
                active
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-600 hover:bg-white/60",
              ].join(" ")}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
