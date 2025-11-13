export type SystemRole = "ADMIN" | "USER";

export type UserRecord = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  system_role: SystemRole;
  is_active: boolean;
  created_at: string; // ISO
};

export type RoleFilter = "all" | "admin" | "user";
export type StatusFilter = "all" | "active" | "inactive";
export type UsersSort =
  | "created_desc"
  | "created_asc"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";

/** Server list response */
export type UsersPage = {
  items: UserRecord[];
  total: number;
  page: number;
  page_size: number;
};

/** Create payload (backend expects password) */
export type CreateUserPayload = {
  email: string;
  password: string;
  display_name: string;
  avatar_url?: string | null;
  system_role?: SystemRole; // default USER
  is_active?: boolean;      // default true
};

export type UpdateUserPayload = {
  display_name?: string;
  avatar_url?: string | null;
  is_active?: boolean;
};
