export const EVENT_CATEGORIES = [
  "Conference",
  "Youth Meeting",
  "Prayer Night",
  "Retreat",
  "Bible Study",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type LivePlatform = "Zoom" | "Google Meet" | "YouTube Live" | "None";

export interface EventDto {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  location: string;
  isLive: boolean;
  liveMeetingUrl: string;
  livePlatform: LivePlatform;
  images: string[];
  photoAdUrl?: string;
  videoAdUrl?: string;
  voiceAdUrl?: string;
  attendeeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  location: string;
  isLive?: boolean;
  liveMeetingUrl?: string;
  livePlatform?: LivePlatform;
  organizer?: string | null;
  churchId?: string;
  photoAdUrl?: string;
  videoAdUrl?: string;
  voiceAdUrl?: string;
  approvalStatus?: "pending" | "approved" | "rejected" | "archived";
}
