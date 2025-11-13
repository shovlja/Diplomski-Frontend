// src/hooks/useTeamsQuery.ts
import * as React from "react";
import {
  listMyTeams,
  getTeamDetails,
  createTeam,
  updateTeam,
  deleteTeam,
} from "@/features/teams/api";
import type { Team, TeamBrief, TeamCreateIn, TeamUpdateIn } from "@/features/teams/types";

export function useTeamsMe() {
  const [data, setData] = React.useState<TeamBrief[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const teams = await listMyTeams();
      setData(teams ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}

export function useTeamDetailsSimple(teamId: number | null, enabled = true) {
  const [data, setData] = React.useState<Team | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refetch = React.useCallback(async () => {
    if (!teamId || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const team = await getTeamDetails(teamId);
      setData(team);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [teamId, enabled]);

  React.useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}

// — mutacije kao helpers —
export async function createTeamAction(payload: TeamCreateIn) {
  return await createTeam(payload);
}
export async function updateTeamAction(teamId: number, payload: TeamUpdateIn) {
  return await updateTeam(teamId, payload);
}
export async function deleteTeamAction(teamId: number) {
  await deleteTeam(teamId);
}
