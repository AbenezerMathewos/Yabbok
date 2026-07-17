import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requireUser } from "@/backend/auth/session";
import Event from "@/backend/models/Event";

type EventRsvpContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: Request, ctx: EventRsvpContext) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    await connectToDatabase();

    const event = await Event.findOneAndUpdate(
      { _id: id, approvalStatus: "approved", deletedAt: { $exists: false } },
      { $addToSet: { attendees: user.id } },
      { new: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ registered: true, attendeeCount: event.attendees.length });
  } catch (error) {
    return handleApiError(error, "Event RSVP failed");
  }
}

export async function DELETE(_req: Request, ctx: EventRsvpContext) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;

    await connectToDatabase();

    const event = await Event.findByIdAndUpdate(
      id,
      { $pull: { attendees: user.id } },
      { new: true }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ registered: false, attendeeCount: event.attendees.length });
  } catch (error) {
    return handleApiError(error, "Event RSVP removal failed");
  }
}


