import { api } from "@/lib/http";
import type { Notification } from "./types";

export async function listNotifications(): Promise<Notification[]> {
  const { data } = await api.get("/api/v1/notifications/me");
  return data as Notification[];
}

export async function acceptInvite(notificationId: number): Promise<void> {
  await api.patch(`/api/v1/notifications/${notificationId}/accept`);
}

export async function declineInvite(notificationId: number): Promise<void> {
  await api.patch(`/api/v1/notifications/${notificationId}/decline`);
}
