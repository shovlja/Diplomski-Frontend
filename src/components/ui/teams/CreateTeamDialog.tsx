import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import InviteMemberForm from "@/components/ui/teams/InviteMemberForm";
import { createTeam, inviteByEmail, getTeamDetails } from "@/features/teams/api";
import type { Team } from "@/features/teams/types";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Biće pozvano čim se tim uspešno napravi (sa sve članovima ako ih kasnije dodaš). */
  onCreated: (team: Team) => void;
};

/** Bez `any`: izvuče poruku iz axios greške ili iz klasičnog Error-a. */
type HttpishError = { response?: { data?: { detail?: unknown } } };
function extractErrorMessage(err: unknown, fallback = "Operation failed"): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const r = err as HttpishError;
    const d = r.response?.data?.detail;
    if (typeof d === "string" && d.trim()) return d;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function CreateTeamDialog({ open, onClose, onCreated }: Props) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  // step 1 – forma
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // step 2 – posle kreiranja
  const [created, setCreated] = React.useState<Team | null>(null);

  React.useEffect(() => {
    if (!open) {
      // reset kad se zatvori
      setName("");
      setDescription("");
      setError(null);
      setBusy(false);
      setCreated(null);
    }
  }, [open]);

  function handleOverlay(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleCreate() {
    const n = name.trim();
    if (!n) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // isto kao gore: toast.promise ne vraća Team
      const req = createTeam({ name: n, description: description.trim() || null });

      toast.promise(req, {
        loading: "Creating team…",
        success: "Team created.",
        error: "Failed to create team.",
      });

      const raw = await req; // ← pravi rezultat createTeam
      const full = await getTeamDetails(raw.id);
      setCreated(full);
    } catch (e: unknown) {
      setError(extractErrorMessage(e, "Failed to create team"));
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(email: string) {
    if (!created) return;
    const req = inviteByEmail(created.id, email);
    await toast.promise(req, {
      loading: "Sending invite…",
      success: `Invitation sent to ${email}.`,
      error: "Failed to send invite.",
    });
  }

  function finish() {
    if (created) onCreated(created);
    onClose();
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
        {/* header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">
            {created ? "Invite members" : "Create a new team"}
          </h3>
          <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        {!created ? (
          <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-b from-cyan-50/80 to-white p-5 ring-1 ring-zinc-100">
              <div className="mb-4 text-sm text-zinc-600">
                Give your team a clear name and short description. You’ll be able to invite
                members right after you create it.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Team name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} rounded="xl" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Description (optional)</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} rounded="xl" />
                </div>
                {error && <div className="text-sm text-rose-600">{error}</div>}
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="h-40 w-40 rounded-full bg-cyan-500/10 ring-1 ring-cyan-200/50" />
            </div>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="mb-3">
              <div className="text-sm text-zinc-600">
                Team <span className="font-medium text-zinc-900">{created.name}</span> has been created.
                Invite people by email to collaborate.
              </div>
            </div>

            <InviteMemberForm onInvite={handleInvite} />

            <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Tip: invites are sent immediately. Members will appear after they accept the invitation.
            </div>
          </div>
        )}

        {/* footer */}
        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          {!created ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={busy}>
                {busy ? "Creating…" : "Create team"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={finish}>Done</Button>
              <Button onClick={finish}>Open team</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
