import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission, isApprovalStatus } from '../auth/roles';
import mongoose, { Model, Types } from 'mongoose';
import AuditLog from '../models/AuditLog';
import DiscussionTopic from '../models/DiscussionTopic';
import Event from '../models/Event';
import GalleryItem from '../models/GalleryItem';
import Notification from '../models/Notification';
import PrayerRequest from '../models/PrayerRequest';
import Sermon from '../models/Sermon';
import Testimony from '../models/Testimony';
import Announcement from '../models/Announcement';
import User from '../models/User';

const router = express.Router();

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

const contentModels: Record<ContentType, Model<any>> = {
  prayers: PrayerRequest as Model<any>,
  testimonies: Testimony as Model<any>,
  discussions: DiscussionTopic as Model<any>,
  gallery: GalleryItem as Model<any>,
  sermons: Sermon as Model<any>,
  events: Event as Model<any>,
  announcements: Announcement as Model<any>,
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

// requireAuth middleware ensures req.user is set
router.use(requireAuth);

router.get('/moderation', async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role as any, "content:moderate")) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const type = req.query.type as string | undefined;
    const status = (req.query.status as string) || "pending";

    if (type && !isContentType(type)) {
      return res.status(400).json({ error: "Invalid content type" });
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

    res.json(results.flat());
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Moderation queue fetch failed", details: error.message });
  }
});

router.patch('/moderation', async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role as any, "content:moderate")) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const moderator = user;
    const { type, id, status, note } = req.body;

    if (!isContentType(type) || !id || !isApprovalStatus(status)) {
      return res.status(400).json({ error: "Invalid moderation request" });
    }

    if ((type === "gallery" || type === "sermons" || type === "events" || type === "announcements") && status === "approved" && moderator.role !== "super_admin") {
      return res.status(403).json({ error: "Only super admin can approve gallery, sermon, event, and announcement content." });
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
      return res.status(404).json({ error: "Content not found" });
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

      const recipients = await User.find(userQuery as any).select("_id");
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

    res.json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Moderation update failed", details: error.message });
  }
});

export default router;
