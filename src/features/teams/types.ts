// src/features/teams/types.ts

export type TeamRole = "owner" | "manager" | "developer";

export type TeamMember = {
  id: number;          // id reda u TeamMember tabeli
  user_id: string;     // UUID korisnika
  role: TeamRole;
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string | null;
  } | null;
};

export type Team = {
  id: number;
  name: string;
  description?: string | null;
  is_archived: boolean;
  members: TeamMember[];
  
};

/** Lakši prikaz za listu (/teams/me) */
export type TeamBrief = {
  id: number;
  name: string;
  description?: string | null;
  members?: Pick<TeamMember, "id">[];
  is_starred?: boolean;
};

/** payload za POST /teams */
export type TeamCreateIn = {
  name: string;
  description?: string | null;
};

/** payload za PATCH /teams/{id}  ⬅️ dodali smo is_starred */
export type TeamUpdateIn = Partial<
  Pick<Team, "name" | "description" | "is_archived">
>;

/** Label mapping za UI */
export const TeamRoleLabel: Record<TeamRole, string> = {
  owner: "Owner",
  manager: "Manager",
  developer: "Developer",
};

export function teamInitial(name: string): string {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}
