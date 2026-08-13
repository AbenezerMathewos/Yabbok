import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requirePermission } from "@/backend/auth/session";
import Event from "@/backend/models/Event";

type EventAttendeesContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, ctx: EventAttendeesContext) {
  try {
    await requirePermission("event:rsvp:view");
    const { id } = await ctx.params;

    await connectToDatabase();

    const event = await Event.findById(id)
      .populate("attendees", "name email phone churchBranch role")
      .select("title date attendees");

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error, "Event attendees fetch failed");
  }
}


