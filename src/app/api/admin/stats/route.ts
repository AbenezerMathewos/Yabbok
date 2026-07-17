import { NextResponse } from "next/server";
import { handleApiError, requirePermission } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import Church from "@/backend/models/Church";
import Event from "@/backend/models/Event";
import PrayerRequest from "@/backend/models/PrayerRequest";
import Testimony from "@/backend/models/Testimony";
import Suggestion from "@/backend/models/Suggestion";
import DiscussionTopic from "@/backend/models/DiscussionTopic";
import GalleryItem from "@/backend/models/GalleryItem";
import Sermon from "@/backend/models/Sermon";
import Report from "@/backend/models/Report";
import Announcement from "@/backend/models/Announcement";

export async function GET() {
  try {
    await requirePermission("analytics:view");

    await connectToDatabase();

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

    return NextResponse.json({
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
  } catch (error) {
    return handleApiError(error, "Admin stats fetch failed");
  }
}
