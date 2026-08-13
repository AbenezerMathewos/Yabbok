import Event, { IEvent } from "../models/Event";
import { Types } from "mongoose";

// Local copies of the types from frontend to avoid complex relative imports
type LivePlatform = "Zoom" | "Google Meet" | "YouTube Live" | "None";
type EventCategory = "Conference" | "Youth Meeting" | "Prayer Night" | "Retreat" | "Bible Study";
const EVENT_CATEGORIES: EventCategory[] = ["Conference", "Youth Meeting", "Prayer Night", "Retreat", "Bible Study"];

interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  date: string | Date;
  endDate?: string | Date;
  location: string;
  isLive?: boolean;
  liveMeetingUrl?: string;
  livePlatform?: LivePlatform;
  photoAdUrl?: string;
  videoAdUrl?: string;
  voiceAdUrl?: string;
  organizer?: Types.ObjectId | string;
  churchId?: Types.ObjectId | string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

interface EventDto {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  endDate?: string;
  location: string;
  isLive?: boolean;
  liveMeetingUrl?: string;
  livePlatform?: LivePlatform;
  images?: string[];
  photoAdUrl?: string;
  videoAdUrl?: string;
  voiceAdUrl?: string;
  attendeeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

const LIVE_PLATFORMS: LivePlatform[] = ["Zoom", "Google Meet", "YouTube Live", "None"];

const defaultEvents: CreateEventInput[] = [
  {
    title: "National KHC Youth Conference 2026",
    description:
      "Annual gathering of all Kale Hiywet Church youth fellowships in Ethiopia. Join for three days of worship, teaching, and networking.",
    category: "Conference",
    date: "2026-08-15T09:00:00",
    endDate: "2026-08-17T17:00:00",
    location: "Addis Ababa KHC HQ Hall A",
    isLive: true,
    liveMeetingUrl: "https://youtube.com/live/placeholder",
    livePlatform: "YouTube Live",
  },
  {
    title: "Joint Fellowship Prayer Night",
    description:
      "A night of passionate prayers, intercessions, and praises with youth ministries from Hawassa, Adama, and Addis Ababa branches.",
    category: "Prayer Night",
    date: "2026-06-25T18:00:00",
    endDate: "2026-06-26T06:00:00",
    location: "Hawassa Yeheyz KHC Sanctuary",
    isLive: true,
    liveMeetingUrl: "https://zoom.us/j/placeholder",
    livePlatform: "Zoom",
  },
  {
    title: "Leadership Discipleship Retreat",
    description:
      "Spiritual renewal and leadership training for youth committee leaders, Sunday school teachers, and choir coordinators.",
    category: "Retreat",
    date: "2026-07-10T14:00:00",
    endDate: "2026-07-12T16:00:00",
    location: "Bishoftu KHC Retreat Center",
    isLive: false,
    liveMeetingUrl: "",
    livePlatform: "None",
  },
  {
    title: "Youth Weekly Interactive Bible Study",
    description: "Deep dive study into the Book of Romans. Live Q&A and breakout group discussions.",
    category: "Bible Study",
    date: "2026-06-15T19:00:00",
    endDate: "2026-06-15T21:00:00",
    location: "Google Meet Virtual Hall",
    isLive: true,
    liveMeetingUrl: "https://meet.google.com/abc-defg-hij",
    livePlatform: "Google Meet",
  },
];

function isEventCategory(value: unknown): value is EventCategory {
  return typeof value === "string" && EVENT_CATEGORIES.includes(value as EventCategory);
}

function isLivePlatform(value: unknown): value is LivePlatform {
  return typeof value === "string" && LIVE_PLATFORMS.includes(value as LivePlatform);
}

function toEventDto(event: IEvent): EventDto {
  return {
    _id: event._id.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date.toISOString(),
    endDate: event.endDate?.toISOString(),
    location: event.location,
    isLive: event.isLive,
    liveMeetingUrl: event.liveMeetingUrl || "",
    livePlatform: event.livePlatform,
    images: event.images || [],
    photoAdUrl: event.photoAdUrl || "",
    videoAdUrl: event.videoAdUrl || "",
    voiceAdUrl: event.voiceAdUrl || "",
    attendeeCount: event.attendees?.length || 0,
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}

function normalizeEventInput(input: Partial<CreateEventInput>): CreateEventInput {
  const title = input.title?.trim();
  const description = input.description?.trim();
  const location = input.location?.trim();
  const livePlatform = input.livePlatform || "None";

  if (!title || !description || !location || !input.date || !isEventCategory(input.category)) {
    throw new Error("Missing required event fields");
  }

  if (!isLivePlatform(livePlatform)) {
    throw new Error("Invalid live platform");
  }

  return {
    title,
    description,
    category: input.category,
    date: input.date,
    endDate: input.endDate,
    location,
    isLive: Boolean(input.isLive),
    liveMeetingUrl: input.liveMeetingUrl?.trim() || "",
    livePlatform,
    organizer: input.organizer || undefined,
    churchId: input.churchId || undefined,
    photoAdUrl: input.photoAdUrl || "",
    videoAdUrl: input.videoAdUrl || "",
    voiceAdUrl: input.voiceAdUrl || "",
    approvalStatus: input.approvalStatus,
  };
}

async function seedEventsIfEmpty() {
  const count = await Event.countDocuments();

  if (count > 0) {
    return;
  }

  await Event.insertMany(
    defaultEvents.map((event) => ({
      ...event,
      date: new Date(event.date),
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      attendees: [],
      images: [],
    }))
  );
}

export async function listEvents(includeAll = false): Promise<EventDto[]> {

  await seedEventsIfEmpty();

  const query: any = { deletedAt: { $exists: false } };
  if (!includeAll) {
    query.approvalStatus = "approved";
  }

  const events = await Event.find(query).sort({ date: 1 });
  return events.map(toEventDto);
}

export async function createEvent(input: Partial<CreateEventInput>): Promise<EventDto> {
  const eventInput = normalizeEventInput(input);



  const event = await Event.create({
    title: eventInput.title,
    description: eventInput.description,
    category: eventInput.category,
    date: new Date(eventInput.date),
    endDate: eventInput.endDate ? new Date(eventInput.endDate) : undefined,
    location: eventInput.location,
    isLive: eventInput.isLive,
    liveMeetingUrl: eventInput.liveMeetingUrl,
    livePlatform: eventInput.livePlatform,
    organizer: eventInput.organizer || undefined,
    churchId: eventInput.churchId || undefined,
    approvalStatus: eventInput.approvalStatus || "pending",
    photoAdUrl: eventInput.photoAdUrl,
    videoAdUrl: eventInput.videoAdUrl,
    voiceAdUrl: eventInput.voiceAdUrl,
    attendees: [],
    images: [],
  });

  return toEventDto(event);
}
