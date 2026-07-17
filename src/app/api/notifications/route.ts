import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requireUser } from "@/backend/auth/session";
import Notification from "@/backend/models/Notification";

export async function GET() {
  try {
    const user = await requireUser();
    await connectToDatabase();

    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiError(error, "Notifications fetch failed");
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const { notificationId, read = true } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: user.id },
      { read },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    return handleApiError(error, "Notification update failed");
  }
}
