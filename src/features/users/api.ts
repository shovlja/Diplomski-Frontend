import { api } from "@/lib/http";
import type {
  UsersPage,
  UserRecord,
  SystemRole,
  CreateUserPayload,
  UpdateUserPayload,
  RoleFilter,
  StatusFilter,
  UsersSort,
} from "./types";

const BASE = "/api/v1/users";

export type UserBrief = {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
};

export type UsersSearchParams = {
  q: string;
  limit?: number;
};

export async function searchUsersByEmail(
  q: string,
  limit = 8
): Promise<UserBrief[]> {
  if (!q.trim()) return [];
  const { data } = await api.get(`/api/v1/users`, {
    params: {
      q,
      status: "active",
      role: "all",
      sort: "created_desc",
      page: 1,
      page_size: limit,
    },
  });
  // backend vraća { items, total, ... }
  return (data?.items ?? []) as UserBrief[];
}

/** Server-side list (paginirano) */
export async function listUsers(params: {
  q?: string;
  role?: RoleFilter;
  status?: StatusFilter;
  sort?: UsersSort;
  page?: number;
  page_size?: number;
}) {
  const { data } = await api.get<UsersPage>(BASE, { params });
  return data;
}

/** Učitaj SVE korisnike (skuplja strane po 100) – zgodno ako filtriraš na klijentu */
export async function listAllUsers(): Promise<UserRecord[]> {
  const acc: UserRecord[] = [];
  let page = 1;
  let total = Infinity;
  const page_size = 100;

  while (acc.length < total) {
    const data = await listUsers({
      page,
      page_size,
      role: "all",
      status: "all",
      sort: "created_desc",
    });
    acc.push(...data.items);
    total = data.total;
    page += 1;
    if (!data.items.length) break;
  }
  return acc;
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await api.post<UserRecord>(BASE, payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const { data } = await api.patch<UserRecord>(`${BASE}/${id}`, payload);
  return data;
}

export async function setUserRole(id: string, role: SystemRole) {
  const { data } = await api.patch<UserRecord>(`${BASE}/${id}/role`, {
    system_role: role,
  });
  return data;
}

export async function setUserActive(id: string, is_active: boolean) {
  const { data } = await api.patch<UserRecord>(`${BASE}/${id}/active`, {
    is_active,
  });
  return data;
}

export async function deleteUser(id: string) {
  await api.delete(`${BASE}/${id}`);
}
