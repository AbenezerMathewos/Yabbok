import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { hasPermission } from '../../auth/roles';
import User from '../../models/User';
import Church from '../../models/Church';
import Event from '../../models/Event';
import PrayerRequest from '../../models/PrayerRequest';
import Testimony from '../../models/Testimony';
import Suggestion from '../../models/Suggestion';
import DiscussionTopic from '../../models/DiscussionTopic';
import GalleryItem from '../../models/GalleryItem';
import Sermon from '../../models/Sermon';
import Report from '../../models/Report';
import Announcement from '../../models/Announcement';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "analytics:view")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalChurches,
      totalEvents,
      totalPrayers,
      totalTestimonies,
      totalSuggestions,
      totalDiscussions,
      pendingTestimonies,
      pendingPrayers,
      pendingDiscussions,
      pendingGallery,
      pendingSermons,
      pendingEvents,
      openReports,
      totalAnnouncements,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "pending" }),
      Church.countDocuments({}),
      Event.countDocuments({}),
      PrayerRequest.countDocuments({}),
      Testimony.countDocuments({}),
      Suggestion.countDocuments({}),
      DiscussionTopic.countDocuments({}),
      Testimony.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      PrayerRequest.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      DiscussionTopic.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      GalleryItem.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      Sermon.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      Event.countDocuments({ approvalStatus: "pending", deletedAt: { $exists: false } }),
      Report.countDocuments({ status: { $in: ["open", "reviewing"] } }),
      Announcement.countDocuments({}),
    ]);

    const pendingContent =
      pendingTestimonies + pendingPrayers + pendingDiscussions + pendingGallery + pendingSermons + pendingEvents;

    res.json({
      totalUsers,
      activeUsers,
      pendingUsers,
      totalChurches,
      totalEvents,
      totalPrayers,
      totalTestimonies,
      totalSuggestions,
      totalDiscussions,
      pendingContent,
      pendingTestimonies,
      pendingPrayers,
      pendingDiscussions,
      pendingGallery,
      pendingSermons,
      pendingEvents,
      openReports,
      totalAnnouncements,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Admin stats fetch failed", details: error.message });
  }
});

export default router;
