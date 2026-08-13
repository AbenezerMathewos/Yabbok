import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { hasPermission } from '../../auth/roles';
import Announcement from '../../models/Announcement';
import AuditLog from '../../models/AuditLog';
import Notification from '../../models/Notification';
import User from '../../models/User';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const admin = req.user;
    if (!hasPermission(admin.role, "announcement:create")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    let query: any = {};
    // Scoped leaders can only see announcements from their own church or those they created
    if (["church_leader", "youth_leader"].includes(admin.role as string)) {
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

    res.json(announcements);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Announcements fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const admin = req.user;
    if (!hasPermission(admin.role, "announcement:create")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { title, message, audience = "all", role, userId } = req.body;
    let targetChurchId = req.body.churchId;

    if (!title || !message || !["all", "role", "church", "user"].includes(audience)) {
      return res.status(400).json({ error: "Title, message, and valid audience are required" });
    }

    let approvalStatus: "pending" | "approved" = "approved";
    const isLeader = ["church_leader", "youth_leader"].includes(admin.role as string);

    if (isLeader) {
      if (audience === "church") {
        targetChurchId = admin.churchId;
      } else if (audience === "all") {
        approvalStatus = "pending";
      } else {
        return res.status(403).json({
          error: "Forbidden: Scoped leaders can only send announcements to their own church, or to all users (subject to Super Admin approval)."
        });
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

      const recipients = await User.find(userQuery as any).select("_id");
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

    res.status(201).json({ announcement, recipientCount });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Announcement send failed", details: error.message });
  }
});

export default router;
