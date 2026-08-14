import { NextResponse } from "next/server";
import { getCurrentUser, requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Notification from "@/backend/models/Notification";

export async function GET() {
  try {
    const userObj = await getCurrentUser();
    if (!userObj) {
      return NextResponse.json([]);
    }

    await connectToDatabase();
    const notifications = await Notification.find({ recipient: userObj.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(notifications);
  } catch (err) {
    return handleApiError(err, "Failed to fetch notifications");
  }
}

export async function PATCH() {
  try {
    const userObj = await requireUser();
    await connectToDatabase();
    await Notification.updateMany({ recipient: userObj.id, read: false }, { read: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err, "Failed to update notifications");
  }
}
