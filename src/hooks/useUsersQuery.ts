import * as React from "react";
import type { SystemRole, UserRecord } from "@/features/users/types";
import {
  listAllUsers,
  setUserActive,
  setUserRole,
  deleteUser as apiDeleteUser,
} from "@/features/users/api";
import { parseApiError } from "@/features/users/utils";

export function useUsersQuery() {
  const [users, setUsers] = React.useState<UserRecord[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ref da izbegnemo stale closure u callbackovima
  const usersRef = React.useRef<UserRecord[] | null>(null);
  React.useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await listAllUsers();
      setUsers(all);
    } catch (e) {
      setError(parseApiError(e, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const refetch = React.useCallback(() => load(), [load]);

  const toggleActive = React.useCallback(async (id: string) => {
    const cur = usersRef.current?.find((u) => u.id === id)?.is_active;
    const next = !cur;
    const updated = await setUserActive(id, !!next);
    setUsers((prev) => (prev ? prev.map((u) => (u.id === id ? updated : u)) : prev));
  }, []);

  const changeRole = React.useCallback(async (id: string, role: SystemRole) => {
    const updated = await setUserRole(id, role);
    setUsers((prev) => (prev ? prev.map((u) => (u.id === id ? updated : u)) : prev));
  }, []);

  const removeUser = React.useCallback(async (id: string) => {
    await apiDeleteUser(id);
    setUsers((prev) => (prev ? prev.filter((u) => u.id !== id) : prev));
  }, []);

  return { users, isLoading, error, refetch, toggleActive, changeRole, removeUser };
}
