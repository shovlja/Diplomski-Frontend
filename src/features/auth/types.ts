export type AuthUser = {
    id: string;                 // UUID kao string (backend šalje ovako)
    display_name: string;
    email: string;
    system_role?: "USER" | "ADMIN";
    is_active?: boolean;
    avatar_url?: string | null;
    created_at?: string;
  };