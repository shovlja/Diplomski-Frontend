import * as React from "react";
import { createPortal } from "react-dom";
import { getTeamDetails } from "@/features/teams/api";

type MemberRow = { id: string; name: string };

/** Stabilan type-guard */
type TeamDetailsShape = { members: unknown[] };
const hasMembers = (x: unknown): x is TeamDetailsShape =>
  typeof x === "object" && x !== null && Array.isArray((x as TeamDetailsShape).members);

/** Preferiraj user UUID (user.id / user_id), tek onda fallback na membership id */
function normalizeMember(row: unknown): MemberRow | null {
  if (typeof row !== "object" || row === null) return null;
  const o = row as Record<string, unknown>;
  const user = typeof o["user"] === "object" && o["user"] !== null ? (o["user"] as Record<string, unknown>) : undefined;

  // 👇 prvo user.id (UUID), pa user_id (UUID), pa tek membership id
  const idCandidates: Array<unknown> = [user?.["id"], o["user_id"], o["userId"], o["id"]];
  let id: string | null = null;
  for (const c of idCandidates) {
    if (typeof c === "string" || typeof c === "number") { id = String(c); break; }
  }

  const nameCandidates: Array<unknown> = [
    o["display_name"], o["full_name"], o["name"],
    user?.["display_name"], user?.["full_name"], user?.["name"],
    o["username"]
  ];
  let name: string | null = null;
  for (const c of nameCandidates) {
    if (typeof c === "string" && c.trim()) { name = c; break; }
  }

  if (!id) return null;
  return { id, name: name ?? id };
}

export default function MembersPopover({
  open,
  onClose,
  anchorRef,
  team,
  teamId,
  initialSelected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  team?: MemberRow[];   // ako stiže spolja, preskoči fetch
  teamId?: number;      // inače fetch prema teams api
  initialSelected?: string[];
  onSave: (ids: string[], rows: MemberRow[]) => void; // vratiće UUID-ove
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const [selected, setSelected] = React.useState<string[]>(initialSelected ?? []);
  React.useEffect(() => setSelected(initialSelected ?? []), [initialSelected]);

  const [rows, setRows] = React.useState<MemberRow[]>(team ?? []);
  const [loading, setLoading] = React.useState(false);

  const updatePosition = React.useCallback(() => {
    const a = anchorRef.current;
    if (!a) return;
    const rect = a.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
  }, [anchorRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();

    const onClick = (e: MouseEvent) => {
      const m = ref.current;
      const a = anchorRef.current;
      if (m && !m.contains(e.target as Node) && a && !a.contains(e.target as Node)) onClose();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition, true);
    };
  }, [open, onClose, updatePosition, anchorRef]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;
      if (team && team.length) { setRows(team); return; }
      if (!teamId) { setRows([]); return; }
      try {
        setLoading(true);
        const res = await getTeamDetails(teamId);
        if (!alive) return;

        const rawMembers = hasMembers(res) ? res.members : [];
        const normalized = rawMembers
          .map(normalizeMember)
          .filter((m): m is MemberRow => !!m);

        setRows(normalized);
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, teamId, team]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const body = (
    <div
      ref={ref}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 60 }}
      className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 text-sm font-semibold text-zinc-700">Members</div>
      <div className="max-h-64 space-y-1 overflow-auto pr-1">
        {loading && <div className="py-2 text-sm text-zinc-500">Loading…</div>}
        {!loading && rows.map((m) => (
          <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-zinc-50">
            <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} />
            <span className="text-sm text-zinc-800">{m.name}</span>
          </label>
        ))}
        {!loading && rows.length === 0 && <div className="py-2 text-sm text-zinc-500">No team members.</div>}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 rounded-md bg-[#1991EB] px-3 py-2 text-sm font-medium text-white hover:bg-[#1586dc]"
          onClick={() => { onSave(selected, rows); onClose(); }}
        >
          Save
        </button>
        <button className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
