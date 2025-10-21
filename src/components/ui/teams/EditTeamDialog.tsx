// src/components/ui/teams/EditTeamDialog.tsx
import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Team } from "@/features/teams/types";
import { updateTeamAction } from "@/hooks/useTeamsQuery";

type Props = {
  team: Team;
  open: boolean;
  onClose: () => void;
  onUpdated: (next: Team) => void;
};

export default function EditTeamDialog({ team, open, onClose, onUpdated }: Props) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  const [name, setName] = React.useState(team.name);
  const [description, setDescription] = React.useState(team.description ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // reset fields whenever dialog opens or team changes
  React.useEffect(() => {
    if (!open) return;
    setName(team.name);
    setDescription(team.description ?? "");
    setError(null);
    setBusy(false);
  }, [open, team]);

  // close on ESC
  React.useEffect(() => {
    function onEsc(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  function extractErrorMessage(err: unknown): string {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const r = (err as { response?: { data?: { detail?: unknown } } }).response;
      const detail = r?.data?.detail;
      if (typeof detail === "string") return detail;
    }
    return (err as Error)?.message ?? "Failed to update team";
  }

  function handleOverlay(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSave() {
    const n = name.trim();
    if (!n) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await updateTeamAction(team.id, {
        name: n,
        description: description.trim() || null,
      });
      onUpdated(next);
      onClose();
    } catch (e: unknown) {
      setError(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
    >
      <div
        className="w-full max-w-[720px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header — same as CreateTeamDialog */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">Edit team</h3>
          <button
            className="cursor-pointer rounded p-1 text-zinc-500 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body — same layout & styling as CreateTeamDialog */}
        <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-b from-cyan-50/80 to-white p-5 ring-1 ring-zinc-100">
            <div className="mb-4 text-sm text-zinc-600">
              Update your team’s name or description. Changes apply immediately.
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Team name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  rounded="xl"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rounded="xl"
                />
              </div>
              {error && <div className="text-sm text-rose-600">{error}</div>}
            </div>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <div className="h-40 w-40 rounded-full bg-cyan-500/10 ring-1 ring-cyan-200/50" />
          </div>
        </div>

        {/* footer — same button styling & behavior */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="ghost" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy} className="cursor-pointer">
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
