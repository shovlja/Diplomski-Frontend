import * as React from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { searchUsers } from "@/features/teams/api";

type Props = {
  onInvite: (email: string) => Promise<void>;
};

export default function InviteMemberForm({ onInvite }: Props) {
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [suggest, setSuggest] = React.useState<
    { id: string; display_name: string; email: string }[]
  >([]);

  React.useEffect(() => {
    let stop = false;
    const q = value.trim();
    if (!q || q.length < 2) {
      setSuggest([]);
      return;
    }
    (async () => {
      try {
        const arr = await searchUsers(q, 5);
        if (!stop) setSuggest(arr.map(({ id, display_name, email }) => ({ id, display_name, email })));
      } catch {
        if (!stop) setSuggest([]);
      }
    })();
    return () => {
      stop = true;
    };
  }, [value]);

  async function submit() {
    const email = value.trim();
    if (!email) return;
    setBusy(true);
    try {
      await onInvite(email);
      setValue("");
      setSuggest([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative grow">
        <Input
          placeholder="Invite by email…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rounded="xl"
        />
        {suggest.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
            {suggest.map((u) => (
              <button
                key={u.id}
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                onClick={() => setValue(u.email)}
                type="button"
              >
                <div className="font-medium text-zinc-900">{u.display_name}</div>
                <div className="text-xs text-zinc-500">{u.email}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button className="h-11 rounded-xl px-5" onClick={submit} disabled={busy || !value.trim()}>
        {busy ? "Inviting…" : "Invite"}
      </Button>
    </div>
  );
}
