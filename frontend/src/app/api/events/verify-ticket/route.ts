import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import RSVP from "@/backend/models/RSVP";

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    if (userObj.role !== "super_admin" && userObj.role !== "moderator" && userObj.role !== "church_leader") {
      return NextResponse.json({ error: "Forbidden: Leader access required" }, { status: 403 });
    }

    const { ticketCode } = await req.json();
    if (!ticketCode || !ticketCode.trim()) {
      return NextResponse.json({ error: "Ticket code required" }, { status: 400 });
    }

    await connectToDatabase();
    const rsvp = await RSVP.findOne({ ticketCode: ticketCode.trim().toUpperCase() })
      .populate("user", "name email phone profilePhoto churchBranch")
      .populate("event", "title date location category");

    if (!rsvp) {
      return NextResponse.json({ error: "Invalid ticket code. No RSVP found." }, { status: 404 });
    }

    const alreadyCheckedIn = rsvp.checkedIn;
    rsvp.checkedIn = true;
    await rsvp.save();

    const totalRsvps = await RSVP.countDocuments({ event: rsvp.event._id });
    const totalCheckedIn = await RSVP.countDocuments({ event: rsvp.event._id, checkedIn: true });

    return NextResponse.json({
      rsvp,
      alreadyCheckedIn,
      stats: { totalRsvps, totalCheckedIn },
    });
  } catch (err) {
    return handleApiError(err, "Failed to verify ticket");
  }
}
