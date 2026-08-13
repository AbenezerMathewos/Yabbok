import { CreateEventInput, EventDto } from "@/frontend/types/events";
import { requestJson } from "@/frontend/lib/api/client";

export function fetchEvents() {
  return requestJson<EventDto[]>("/api/events");
}

export function createEvent(input: CreateEventInput) {
  return requestJson<EventDto>("/api/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerForEvent(eventId: string) {
  return requestJson<{ registered: true; attendeeCount: number }>(`/api/events/${eventId}/rsvp`, {
    method: "POST",
  });
}

export function unregisterFromEvent(eventId: string) {
  return requestJson<{ registered: false; attendeeCount: number }>(`/api/events/${eventId}/rsvp`, {
    method: "DELETE",
  });
}
