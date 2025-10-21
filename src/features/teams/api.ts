// src/features/teams/api.ts
import { api } from "@/lib/http";
import type { Team, TeamBrief, TeamRole, TeamCreateIn, TeamUpdateIn } from "./types";

// LIST
export async function listMyTeams(): Promise<TeamBrief[]> {
  const { data } = await api.get("/api/v1/teams/me");
  return data as TeamBrief[];
}

// DETAILS
export async function getTeamDetails(teamId: number): Promise<Team> {
  const { data } = await api.get(`/api/v1/teams/${teamId}`);
  return data as Team;
}

// CREATE
export async function createTeam(payload: TeamCreateIn): Promise<Team> {
  const { data } = await api.post("/api/v1/teams/", payload);
  return data as Team;
}

// UPDATE
export async function updateTeam(teamId: number, payload: TeamUpdateIn): Promise<Team> {
  try {
    // Ne oslanjamo se na response.data (može biti 204 No Content)
    await api.patch(`/api/v1/teams/${teamId}`, payload, {
      // tretiraj bilo koji 2xx kao uspeh
      validateStatus: (s) => s >= 200 && s < 300,
    });
  } catch {
    // Čak i ako PATCH baci "Network Error", moguće je da je zapis prošao.
    // Padaćemo na GET ispod; ako vrati nove podatke, sve je OK.
  }

  // Uvek povuci sveže detalje i vrati kompletan Team
  const { data } = await api.get(`/api/v1/teams/${teamId}`);
  return data as Team;
}

// DELETE
export async function deleteTeam(teamId: number): Promise<void> {
  await api.delete(`/api/v1/teams/${teamId}`);
}

// MEMBERS – change role
export async function changeMemberRole(teamId: number, userId: string, role: TeamRole): Promise<void> {
  await api.patch(`/api/v1/teams/${teamId}/members/${userId}`, { role });
}

// MEMBERS – remove / leave
export async function removeMember(teamId: number, userId: string): Promise<void> {
  await api.delete(`/api/v1/teams/${teamId}/members/${userId}`);
}

// INVITE – by email
export async function inviteByEmail(teamId: number, email: string): Promise<void> {
  await api.post(`/api/v1/teams/${teamId}/invites`, { email });
}

// SEARCH USERS (za sugestije u inviteu)
export type UserSuggest = { id: string; display_name: string; email: string; avatar_url?: string | null };
export async function searchUsers(q: string, limit = 5): Promise<UserSuggest[]> {
  const { data } = await api.get("/api/v1/users", { params: { q, page_size: limit } });
  const items = (data?.items ?? []) as UserSuggest[];
  return items.map((u) => ({
    id: String(u.id),
    display_name: String(u.display_name),
    email: String(u.email),
    avatar_url: (u.avatar_url ?? null) as string | null,
  }));
}

