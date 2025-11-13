import { api } from "@/lib/http";
import type { EventItem, CreateEventPayload, UpdateEventPatch } from "./types";

const BASE = "/api/v1/events"; // <-- ABSOLUTNA putanja sa prefiksom

export async function getUpcomingEvents(limit = 5): Promise<EventItem[]> {
    const { data } = await api.get<EventItem[]>(`${BASE}/upcoming`, { params: { limit } });
    return data;
  }

export async function getEventsByDay(dateISO: string): Promise<EventItem[]> {
  const { data } = await api.get<EventItem[]>(BASE, { params: { date: dateISO } });
  return data;
}
export async function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  const { data } = await api.post<EventItem>(BASE, payload);
  return data;
}
export async function updateEvent(id: number, patch: UpdateEventPatch): Promise<EventItem> {
  const { data } = await api.patch<EventItem>(`${BASE}/${id}`, patch);
  return data;
}
export async function deleteEvent(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

export async function getCalendarDays(fromISO: string, toISO: string): Promise<string[]> {
    const { data } = await api.get<{ dates: string[] }>(`${BASE}/calendar`, {
      params: { from: fromISO, to: toISO },
    });
    return data.dates;
  }
