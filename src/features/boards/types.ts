export type BoardPrivacy = "private" | "team" | "public";

export type Member = {
  id: number | string;
  name: string;
  avatarUrl?: string;
};

export type Board = {
  id: number;
  title: string;
  teamName?: string;
  privacy: BoardPrivacy;
  isStarred: boolean;
  lastActivity: string;
  cover?: string;       
  members: Member[];
  tags?: string[];
  isOwner?: boolean;
};

export type FilterKind = "all" | "mine" | "starred";
export type SortKind = "activity_desc" | "activity_asc" | "title_asc" | "title_desc";
