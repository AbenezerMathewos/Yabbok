import express from 'express';
import { requireAuth } from '../middleware/auth';
import Insight from '../models/Insight';
import User from '../models/User';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const insights = await Insight.find({})
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    res.json(insights);
  } catch (error: any) {
    console.error("Insights fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    if (userObj.status !== "active") {
      return res.status(403).json({ error: "Account not active. Await leadership approval." });
    }

    const action = req.query.action as string;
    const body = req.body;

    // 1. Create Devotional / Lesson Learned
    if (!action) {
      const { content, bibleReferences } = body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const newInsight = await Insight.create({
        user: userObj.id,
        content,
        bibleReferences: bibleReferences || [],
        reactions: [],
        comments: [],
      });

      const populated = await newInsight.populate("user", "name profilePhoto role");
      return res.status(201).json(populated);
    }

    // For actions, target insight ID is required
    const { insightId } = body;
    if (!insightId) {
      return res.status(400).json({ error: "Insight ID is required" });
    }

    const insight = await Insight.findById(insightId);
    if (!insight) {
      return res.status(404).json({ error: "Insight not found" });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      insight.comments.push({
        user: userObj.id,
        content,
        createdAt: new Date(),
      } as any);

      await insight.save();
      const updatedInsight = await Insight.findById(insightId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedInsight);
    }

    // 3. React
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return res.status(400).json({ error: "Reaction type is required" });
      }

      const userId = userObj.id;
      insight.reactions = insight.reactions.filter((r: any) => r.user.toString() !== userId);
      insight.reactions.push({
        user: userId,
        type,
      } as any);

      await insight.save();
      const updatedInsight = await Insight.findById(insightId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedInsight);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error("Insight action error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
