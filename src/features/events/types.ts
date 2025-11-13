export type EventItem = {
    id: number;
    title: string;
    starts_at: string;   // ISO datetime
    created_at: string;  // ISO datetime
  };
  
  export type CreateEventPayload = {
    title: string;
    starts_at: string;   // ISO datetime
  };
  
  export type UpdateEventPatch = Partial<{
    title: string;
    starts_at: string;
  }>;
  