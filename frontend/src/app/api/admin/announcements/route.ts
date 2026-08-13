import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requirePermission } from "@/backend/auth/session";
import Announcement from "@/backend/models/Announcement";
import AuditLog from "@/backend/models/AuditLog";
import Notification from "@/backend/models/Notification";
import User from "@/backend/models/User";

export async function GET() {
  try {
    const admin = await requirePermission("announcement:create");
    await connectToDatabase();

    let query: any = {};
    // Scoped leaders can only see announcements from their own church or those they created
    if (["church_leader", "youth_leader"].includes(admin.role)) {
      query = {
        $or: [
          { createdBy: admin.id },
          { churchId: admin.churchId }
        ]
      };
    }

    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email")
      .populate("churchId", "name city")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(announcements);
  } catch (error) {
    return handleApiError(error, "Announcements fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requirePermission("announcement:create");
    const body = await req.json();
    const { title, message, audience = "all", role, userId } = body;
    let targetChurchId = body.churchId;

    if (!title || !message || !["all", "role", "church", "user"].includes(audience)) {
      return NextResponse.json({ error: "Title, message, and valid audience are required" }, { status: 400 });
    }

    await connectToDatabase();

    let approvalStatus: "pending" | "approved" = "approved";
    const isLeader = ["church_leader", "youth_leader"].includes(admin.role);

    if (isLeader) {
      if (audience === "church") {
        targetChurchId = admin.churchId;
      } else if (audience === "all") {
        approvalStatus = "pending";
      } else {
        return NextResponse.json({
          error: "Forbidden: Scoped leaders can only send announcements to their own church, or to all users (subject to Super Admin approval)."
        }, { status: 403 });
      }
    }

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      role,
      churchId: targetChurchId || undefined,
      userId,
      approvalStatus,
      createdBy: admin.id,
    });

    let recipientCount = 0;

    // Send notifications only if the announcement is approved
    if (approvalStatus === "approved") {
      const userQuery =
        audience === "role"
          ? { role, status: "active" }
          : audience === "church"
            ? { churchId: targetChurchId, status: "active" }
            : audience === "user"
              ? { _id: userId, status: "active" }
              : { status: "active" };

      const recipients = await User.find(userQuery).select("_id");
      recipientCount = recipients.length;

      if (recipients.length > 0) {
        await Notification.insertMany(
          recipients.map((recipient) => ({
            user: recipient._id,
            title,
            message,
            type: "announcement",
            referenceId: announcement._id,
          }))
        );
      }

      await AuditLog.create({
        actor: admin.id,
        action: "ANNOUNCEMENT_SENT",
        targetId: announcement._id,
        targetType: "Announcement",
        details: `Sent to ${recipients.length} recipient(s)`,
      });
    } else {
      // Pending announcement audit log
      await AuditLog.create({
        actor: admin.id,
        action: "ANNOUNCEMENT_SUBMITTED",
        targetId: announcement._id,
        targetType: "Announcement",
        details: "Announcement submitted and pending Super Admin approval.",
      });
    }

    return NextResponse.json({ announcement, recipientCount }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Announcement send failed");
  }
}
