import * as React from "react";
import { useSearchParams } from "react-router-dom";

function fmtHuman(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  }).format(d);
}

export default function EventsView() {
  const [sp] = useSearchParams();
  const iso = sp.get("date");                   // e.g. 2025-09-06
  const date = iso ? new Date(iso) : new Date();

  return (
    <div className="mx-auto max-w-[1100px] p-4">
      <h1 className="text-xl font-semibold text-zinc-900">Events</h1>
      <p className="text-sm text-zinc-500">
        Selected day: <span className="font-medium text-zinc-800">{fmtHuman(date)}</span>
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* left: list for that day */}
        <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-2">Events on this day</div>
          <ul className="text-sm text-zinc-600">
            <li>No events yet (stub).</li>
          </ul>
        </div>

        {/* right: quick-create form (stub) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-900 mb-3">Add event</div>
          <form className="space-y-2">
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Title" />
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" placeholder="Time (e.g. 10:00)" />
            <button
              type="button"
              className="h-10 w-full rounded-full bg-cyan-500 text-white hover:brightness-95"
              onClick={() => alert("Stub: submit to backend later")}
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
