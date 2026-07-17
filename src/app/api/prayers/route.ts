import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireUser } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import PrayerRequest from "@/backend/models/PrayerRequest";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    const canModerate = user && hasPermission(user.role, "content:moderate");
    const prayers = await PrayerRequest.find({
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
    })
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    return NextResponse.json(prayers);
  } catch (error) {
    return handleApiError(error, "Prayers fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    await connectToDatabase();

    // 1. Create a new prayer request
    if (!action) {
      const { content, isAnonymous } = body;
      if (!content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
      }

      const newPrayer = await PrayerRequest.create({
        user: userObj.id,
        churchId: userObj.churchId || undefined,
        content,
        isAnonymous: !!isAnonymous,
        approvalStatus: hasPermission(userObj.role, "content:moderate") ? "approved" : "pending",
        prayedForBy: [],
        comments: [],
        reactions: [],
      });

      const populated = await newPrayer.populate("user", "name profilePhoto role");
      return NextResponse.json(populated, { status: 201 });
    }

    // For actions, target prayer ID is required
    const { prayerId } = body;
    if (!prayerId) {
      return NextResponse.json({ error: "Prayer ID is required" }, { status: 400 });
    }

    const prayer = await PrayerRequest.findById(prayerId);
    if (!prayer) {
      return NextResponse.json({ error: "Prayer request not found" }, { status: 444 });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
      }

      prayer.comments.push({
        user: userObj.id,
        content,
        createdAt: new Date(),
      } as any);

      await prayer.save();
      const updatedPrayer = await PrayerRequest.findById(prayerId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return NextResponse.json(updatedPrayer);
    }

    // 3. Mark as "I Prayed For You"
    if (action === "pray") {
      const userId = userObj.id;
      const index = prayer.prayedForBy.findIndex((id) => id.toString() === userId);

      if (index === -1) {
        // Add to list
        prayer.prayedForBy.push(new mongoose.Types.ObjectId(userId) as any);
      } else {
        // Toggle off if clicked again
        prayer.prayedForBy.splice(index, 1);
      }

      await prayer.save();
      const updatedPrayer = await PrayerRequest.findById(prayerId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return NextResponse.json(updatedPrayer);
    }

    // 4. React (like, love, amen, praise_god, pray)
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
      }

      const userId = userObj.id;
      // Remove existing reaction by user if any
      prayer.reactions = prayer.reactions.filter((r) => r.user.toString() !== userId);
      
      // Add new reaction
      prayer.reactions.push({
        user: userId,
        type,
      } as any);

      await prayer.save();
      const updatedPrayer = await PrayerRequest.findById(prayerId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return NextResponse.json(updatedPrayer);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "Prayer action failed");
  }
}
