import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requireUser } from "@/backend/auth/session";
import Report from "@/backend/models/Report";

const REPORTABLE_TYPES = ["PrayerRequest", "Testimony", "DiscussionTopic", "GalleryItem", "Sermon", "Event", "User"];

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { targetType, targetId, reason, details } = await req.json();

    if (!REPORTABLE_TYPES.includes(targetType) || !targetId || !reason) {
      return NextResponse.json({ error: "Target and reason are required" }, { status: 400 });
    }

    await connectToDatabase();

    const report = await Report.create({
      reporter: user.id,
      targetType,
      targetId,
      reason,
      details: details || "",
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Report submission failed");
  }
}
