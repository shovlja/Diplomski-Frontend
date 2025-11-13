import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateBoard } from "@/features/boards/api";
import type { Board } from "@/features/boards/types";
import { toast } from "sonner";

type TeamPick = { id: number; name: string };

export default function UpdateBoardDialog({
  open,
  board,
  onClose,
  onUpdated,
  teamsProvider,
}: {
  open: boolean;
  board: Board | null;
  onClose: () => void;
  onUpdated: () => void;
  teamsProvider: () => Promise<TeamPick[]>;
}) {
  const [title, setTitle] = React.useState("");
  const [visibility, setVisibility] = React.useState<"private" | "team">("private");
  const [teams, setTeams] = React.useState<TeamPick[]>([]);
  const [teamQuery, setTeamQuery] = React.useState("");
  const [teamId, setTeamId] = React.useState<number | undefined>(undefined);
  const [tags, setTags] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!open || !board) return;
    setTitle(board.title ?? "");
    setVisibility(board.privacy === "team" ? "team" : "private");
    setTeamId(undefined); // backend vraća samo teamName; ID setujemo kad korisnik izabere drugi tim
    setTeamQuery("");
    setTags(board.tags ?? []);
    fetchedRef.current = false;
    setTeams([]);
  }, [open, board]);

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
    if (!board) return;
    if (!title.trim()) return;
    if (visibility === "team" && !teamId && !board.teamName) {
      // ako nije izabran novi tim, a postojeći nije poznat kao ID, sve ok – backend može da ostane isti
    }
    setBusy(true);
    try {
      await updateBoard(board.id, {
        title: title.trim(),
        privacy: visibility,
        team_id: visibility === "team" ? teamId : undefined,
        tags: tags.length ? tags : [],
      });
      toast.success("Board updated.");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update board.");
    } finally {
      setBusy(false);
    }
  }

  if (!open || !board) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-2">
          <h3 className="text-lg font-semibold">Update board</h3>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 pt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Board title"
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
                    placeholder={board.teamName ? `Current: ${board.teamName}` : "Search teams..."}
                    value={teamQuery}
                    onFocus={ensureTeamsLoaded}
                    onChange={async (e) => {
                      const v = e.target.value;
                      setTeamQuery(v);
                      if (!fetchedRef.current) await ensureTeamsLoaded();
                    }}
                  />
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
            <Button type="submit" variant="primary" disabled={busy || !title.trim()}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
