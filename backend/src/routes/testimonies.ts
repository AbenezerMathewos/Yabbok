import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import Testimony from '../models/Testimony';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const canModerate = user && hasPermission(user.role as any, "content:moderate");
    
    const testimonies = await Testimony.find({
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
    })
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    res.json(testimonies);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Testimonies fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    const action = req.query.action as string;
    const body = req.body;

    // 1. Create a new Testimony
    if (!action) {
      const { title, content, media } = body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and Content are required" });
      }

      const newTestimony = await Testimony.create({
        user: userObj.id,
        churchId: userObj.churchId || undefined,
        title,
        content,
        media: media || [],
        approvalStatus: hasPermission(userObj.role, "content:moderate") ? "approved" : "pending",
        comments: [],
        reactions: [],
      });

      const populated = await newTestimony.populate("user", "name profilePhoto role");
      return res.status(201).json(populated);
    }

    // For actions, target testimony ID is required
    const { testimonyId } = body;
    if (!testimonyId) {
      return res.status(400).json({ error: "Testimony ID is required" });
    }

    const testimony = await Testimony.findById(testimonyId);
    if (!testimony) {
      return res.status(404).json({ error: "Testimony not found" });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      testimony.comments.push({
        user: userObj.id,
        content,
        createdAt: new Date(),
      } as any);

      await testimony.save();
      const updatedTestimony = await Testimony.findById(testimonyId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedTestimony);
    }

    // 3. React
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return res.status(400).json({ error: "Reaction type is required" });
      }

      const userId = userObj.id;
      testimony.reactions = testimony.reactions.filter((r: any) => r.user.toString() !== userId);
      testimony.reactions.push({
        user: userId,
        type,
      } as any);

      await testimony.save();
      const updatedTestimony = await Testimony.findById(testimonyId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return res.json(updatedTestimony);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Testimony action failed", details: error.message });
  }
});

export default router;
