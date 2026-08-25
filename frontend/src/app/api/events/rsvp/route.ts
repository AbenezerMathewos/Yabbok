import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import RSVP from "@/backend/models/RSVP";
import { awardBadge } from "@/lib/awardBadge";

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Return existing RSVP if already registered
    const existing = await RSVP.findOne({ user: userObj.id, event: eventId });
    if (existing) {
      return NextResponse.json({ rsvp: existing, unlockedBadge: null });
    }

    const ticketCode = `YSF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newRsvp = await RSVP.create({
      user: userObj.id,
      event: eventId,
      ticketCode,
    });

    // Count total RSVPs for this user
    const totalRsvps = await RSVP.countDocuments({ user: userObj.id });

    // Award fellowship_anchor badge at 3+ RSVPs
    let unlockedBadge = null;
    if (totalRsvps >= 3) {
      unlockedBadge = await awardBadge(userObj.id, "fellowship_anchor");
    }

    return NextResponse.json({ rsvp: newRsvp, unlockedBadge }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to process RSVP");
  }
}
