export type BoardPrivacy = "private" | "team" | "public";

export type Member = {
  id: number;
  name: string;
  avatarUrl?: string;
};

export type Board = {
  id: number;
  title: string;
  teamName?: string;
  privacy: BoardPrivacy;
  isStarred: boolean;
  lastActivity: string; // ISO
  cover?: string;       // css/hex/gradient
  members: Member[];
};

export type FilterKind = "all" | "mine" | "starred";
export type SortKind = "activity_desc" | "activity_asc" | "title_asc" | "title_desc";
