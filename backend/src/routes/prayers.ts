import express from 'express';
import { requireAuth } from '../middleware/auth';
import PrayerRequest from '../models/PrayerRequest';
import mongoose from 'mongoose';
import { hasPermission } from '../auth/roles';
import { getToken } from 'next-auth/jwt';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });
    const canModerate = user && hasPermission(user.role as any, "content:moderate");

    const prayers = await PrayerRequest.find({
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
    })
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    res.json(prayers);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Prayers fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    const action = req.query.action as string;
    const body = req.body;

    // 1. Create a new prayer request
    if (!action) {
      const { content, isAnonymous } = body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
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
      return res.status(201).json(populated);
    }

    // For actions, target prayer ID is required
    const { prayerId } = body;
    if (!prayerId) {
      return res.status(400).json({ error: "Prayer ID is required" });
    }

    const prayer = await PrayerRequest.findById(prayerId);
    if (!prayer) {
      return res.status(404).json({ error: "Prayer request not found" });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return res.status(400).json({ error: "Comment content is required" });
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

      return res.json(updatedPrayer);
    }

    // 3. Mark as "I Prayed For You"
    if (action === "pray") {
      const userId = userObj.id;
      const index = prayer.prayedForBy.findIndex((id) => id.toString() === userId);

      if (index === -1) {
        prayer.prayedForBy.push(new mongoose.Types.ObjectId(userId) as any);
      } else {
        prayer.prayedForBy.splice(index, 1);
      }

      await prayer.save();
      const updatedPrayer = await PrayerRequest.findById(prayerId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedPrayer);
    }

    // 4. React (like, love, amen, praise_god, pray)
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return res.status(400).json({ error: "Reaction type is required" });
      }

      const userId = userObj.id;
      prayer.reactions = prayer.reactions.filter((r) => r.user.toString() !== userId);
      
      prayer.reactions.push({
        user: userId,
        type,
      } as any);

      await prayer.save();
      const updatedPrayer = await PrayerRequest.findById(prayerId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedPrayer);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Prayer action failed", details: error.message });
  }
});

export default router;
