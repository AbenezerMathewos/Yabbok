import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import RSVP from "@/backend/models/RSVP";

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    const { eventId } = await req.json();
    await connectToDatabase();

    let existing = await RSVP.findOne({ user: userObj.id, event: eventId });
    if (existing) {
      return NextResponse.json(existing);
    }

    const ticketCode = `YSF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newRsvp = await RSVP.create({
      user: userObj.id,
      event: eventId,
      ticketCode,
    });

    return NextResponse.json(newRsvp, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to process RSVP");
  }
}
