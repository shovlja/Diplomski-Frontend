import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createBoard } from "@/features/boards/api";
import { toast } from "sonner";

type TeamPick = { id: number; name: string };

export default function CreateBoardDialog({
  open,
  onClose,
  onCreated,
  teamsProvider,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  teamsProvider: () => Promise<TeamPick[]>;
}) {
  const [title, setTitle] = React.useState("");
  const [visibility, setVisibility] = React.useState<"private" | "team">("private");
  const [teams, setTeams] = React.useState<TeamPick[]>([]);
  const [teamQuery, setTeamQuery] = React.useState("");
  const [teamId, setTeamId] = React.useState<number | undefined>(undefined);
  const [tags, setTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  // učitavaj timove tek kad otvoriš i kad pretražuješ (na prvi fokus ili prvi unos)
  const fetchedRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    if (visibility !== "team") return;
    if (fetchedRef.current) return;
    // defer: tek kad korisnik nešto ukuca; ovde ne radimo fetch odmah
  }, [open, visibility]);

  async function ensureTeamsLoaded() {
    if (!fetchedRef.current) {
      try {
        const data = await teamsProvider();
        setTeams(data);
      } catch {
        setTeams([]);
      } finally {
        fetchedRef.current = true;
      }
    }
  }

  const filtered = teamQuery.length
    ? teams.filter((t) => t.name.toLowerCase().includes(teamQuery.toLowerCase()))
    : [];

  const ALL_TAGS = [
    "Platform", "Marketing", "Design",
    "Roadmap", "Sprint", "Backlog",
    "QA", "Content", "UX", "Research",
    "Personal", "OKR",
  ];

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (visibility === "team" && !teamId) return;
    setBusy(true);
    try {
      await createBoard({
        title: title.trim(),
        privacy: visibility,
        team_id: visibility === "team" ? teamId : undefined,
        tags: tags.length ? tags : undefined,
      });
      toast.success("Board created.");
      onCreated();
      onClose();
      // reset
      setTitle("");
      setVisibility("private");
      setTeamId(undefined);
      setTeamQuery("");
      setTags([]);
      fetchedRef.current = false;
      setTeams([]);
    } catch {
      toast.error("Failed to create board.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-2">
          <h3 className="text-lg font-semibold">Create board</h3>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. PMHub – Core Roadmap"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Visibility</label>
            <div className="flex gap-2">
              <Button type="button" variant={visibility === "private" ? "subtle" : "outline"} onClick={() => setVisibility("private")}>
                Private
              </Button>
              <Button type="button" variant={visibility === "team" ? "subtle" : "outline"} onClick={() => setVisibility("team")}>
                Team
              </Button>
            </div>
          </div>

          {visibility === "team" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Team (owner)</label>
                <div className="relative">
                  <Input
                    placeholder="Search teams..."
                    value={teamQuery}
                    onFocus={ensureTeamsLoaded}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setTeamQuery(v);
                      if (!fetchedRef.current) await ensureTeamsLoaded();
                    }}
                  />
                  {/* Lista timova se pojavljuje samo kad krene unos */}
                  {teamQuery.length > 0 && (
                    <div className="mt-1 max-h-56 overflow-auto rounded-md border border-zinc-200 bg-white">
                      {filtered.length === 0 && (
                        <div className="p-2 text-sm text-zinc-500">No teams</div>
                      )}
                      {filtered.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTeamId(t.id)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                            teamId === t.id ? "bg-teal-50" : ""
                          }`}
                        >
                          <span>{t.name}</span>
                          {teamId === t.id && (
                            <span className="text-xs text-teal-600">Selected</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`rounded-md border px-2 py-1 text-xs ${
                        tags.includes(t)
                          ? "border-teal-300 bg-teal-50"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !title.trim() || (visibility === "team" && !teamId)}
            >
              {busy ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
