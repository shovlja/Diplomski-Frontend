import * as React from "react";
import { useParams } from "react-router-dom";
import InviteMemberForm from "@/components/ui/teams/InviteMemberForm";
import { useTeamDetailsSimple } from "@/hooks/useTeamsQuery";
import { inviteByEmail } from "@/features/teams/api";
import { toast } from "sonner";

export default function TeamDetailsView() {
  const params = useParams();
  const teamId = Number(params.teamId);
  const { data, loading, error, refetch } = useTeamDetailsSimple(teamId);

  if (error) return <div className="p-4 text-red-600">Failed to load team.</div>;
  if (loading) return <div className="p-4">Loading…</div>;
  if (!data) return <div className="p-4">Team not found</div>;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <p className="text-sm text-zinc-500">{data.description ?? "No description"}</p>
        </div>

        <InviteMemberForm
          onInvite={async (email) => {
            await toast.promise(inviteByEmail(teamId, email), {
              loading: "Sending invite…",
              success: `Invitation sent to ${email}.`,
              error: "Failed to send invite.",
            });
            await refetch();
          }}
        />
      </div>

      <section>
        <h2 className="mb-2 text-base font-medium">Members</h2>
        <ul className="divide-y rounded-xl border">
          {data.members?.map((m) => (
            <li key={m.id} className="flex items-center justify-between p-3">
              <span>User #{m.user_id}</span>
              <span className="rounded bg-zinc-100 px-2 py-1 text-xs">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
