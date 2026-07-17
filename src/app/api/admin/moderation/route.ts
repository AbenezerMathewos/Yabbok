import { NextResponse } from "next/server";
import { Model, Types } from "mongoose";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requirePermission } from "@/backend/auth/session";
import { isApprovalStatus } from "@/backend/auth/roles";
import AuditLog from "@/backend/models/AuditLog";
import DiscussionTopic from "@/backend/models/DiscussionTopic";
import Event from "@/backend/models/Event";
import GalleryItem from "@/backend/models/GalleryItem";
import Notification from "@/backend/models/Notification";
import PrayerRequest from "@/backend/models/PrayerRequest";
import Sermon from "@/backend/models/Sermon";
import Testimony from "@/backend/models/Testimony";
import Announcement from "@/backend/models/Announcement";
import User from "@/backend/models/User";

type ContentType = "prayers" | "testimonies" | "discussions" | "gallery" | "sermons" | "events" | "announcements";

interface ModeratableDocument {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  organizer?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  approvalStatus?: string;
  moderationNote?: string;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
}

const contentModels: Record<ContentType, Model<ModeratableDocument>> = {
  prayers: PrayerRequest as Model<ModeratableDocument>,
  testimonies: Testimony as Model<ModeratableDocument>,
  discussions: DiscussionTopic as Model<ModeratableDocument>,
  gallery: GalleryItem as Model<ModeratableDocument>,
  sermons: Sermon as Model<ModeratableDocument>,
  events: Event as Model<ModeratableDocument>,
  announcements: Announcement as Model<ModeratableDocument>,
};

const populateByType: Partial<Record<ContentType, string[]>> = {
  prayers: ["user"],
  testimonies: ["user"],
  discussions: ["user"],
  gallery: ["uploadedBy"],
  sermons: ["uploadedBy"],
  events: ["organizer"],
  announcements: ["createdBy"],
};

function isContentType(value: unknown): value is ContentType {
  return typeof value === "string" && value in contentModels;
}

function getOwnerId(item: ModeratableDocument) {
  return item.user || item.uploadedBy || item.organizer || item.createdBy;
}

export async function GET(req: Request) {
  try {
    await requirePermission("content:moderate");
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status") || "pending";

    if (type && !isContentType(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const types = type ? [type as ContentType] : (Object.keys(contentModels) as ContentType[]);
    const results = await Promise.all(
      types.map(async (contentType) => {
        let query = contentModels[contentType]
          .find({ approvalStatus: status, deletedAt: { $exists: false } })
          .sort({ createdAt: -1 })
          .limit(50);

        for (const field of populateByType[contentType] || []) {
          query = query.populate(field, "name email churchBranch");
        }

        const items = await query;
        return items.map((item: any) => ({ type: contentType, item }));
      })
    );

    return NextResponse.json(results.flat());
  } catch (error) {
    return handleApiError(error, "Moderation queue fetch failed");
  }
}

export async function PATCH(req: Request) {
  try {
    const moderator = await requirePermission("content:moderate");
    const { type, id, status, note } = await req.json();

    if (!isContentType(type) || !id || !isApprovalStatus(status)) {
      return NextResponse.json({ error: "Invalid moderation request" }, { status: 400 });
    }

    await connectToDatabase();

    if ((type === "gallery" || type === "sermons" || type === "events" || type === "announcements") && status === "approved" && moderator.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admin can approve gallery, sermon, event, and announcement content." }, { status: 403 });
    }

    const item = await contentModels[type].findByIdAndUpdate(
      id,
      {
        approvalStatus: status,
        moderationNote: note || "",
        moderatedBy: moderator.id,
        moderatedAt: new Date(),
      },
      { new: true }
    );

    if (!item) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const ownerId = getOwnerId(item);
    if (ownerId) {
      await Notification.create({
        user: ownerId,
        title: `Content ${status}`,
        message: note || `Your ${type} submission was ${status}.`,
        type: "approval",
        referenceId: item._id,
      });
    }

    // Trigger notifications for approved announcements
    if (type === "announcements" && status === "approved") {
      const announcement = item as any;
      const userQuery =
        announcement.audience === "role"
          ? { role: announcement.role, status: "active" }
          : announcement.audience === "church"
            ? { churchId: announcement.churchId, status: "active" }
            : announcement.audience === "user"
              ? { _id: announcement.userId, status: "active" }
              : { status: "active" };

      const recipients = await User.find(userQuery).select("_id");
      if (recipients.length > 0) {
        await Notification.insertMany(
          recipients.map((recipient) => ({
            user: recipient._id,
            title: announcement.title,
            message: announcement.message,
            type: "announcement",
            referenceId: announcement._id,
          }))
        );
      }
    }

    await AuditLog.create({
      actor: moderator.id,
      action: "CONTENT_MODERATION",
      targetId: item._id,
      targetType: type,
      details: `Status changed to ${status}${note ? `: ${note}` : ""}`,
    });

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error, "Moderation update failed");
  }
}
