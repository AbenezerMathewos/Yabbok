import express from 'express';
import { requireAuth } from '../middleware/auth';
import DiscussionTopic from '../models/DiscussionTopic';
import User from '../models/User';
import mongoose from 'mongoose';
import { hasPermission } from '../auth/roles';

const router = express.Router();

const defaultTopics = [
  {
    title: "How to read the Bible effectively every day?",
    content: "Greetings brethren, I want to start a daily Bible reading routine. What study methods or plans have helped you remain consistent and comprehend the scriptures better?",
    category: "Bible Study",
    replies: [],
    likes: [],
    bookmarks: [],
  },
  {
    title: "Navigating Career choices as a Christian Youth",
    content: "How do you align your professional goals with God's calling? When should we prioritize ministry service versus professional advancement? Let's discuss.",
    category: "Career",
    replies: [],
    likes: [],
    bookmarks: [],
  },
  {
    title: "Building healthy boundaries in Christian Relationships",
    content: "What are some biblical principles and practical tips for dating, choosing a spouse, and maintaining purity while dating in today's digital culture?",
    category: "Relationships",
    replies: [],
    likes: [],
    bookmarks: [],
  },
];

router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string;
    
    // Auto-seed if empty
    const count = await DiscussionTopic.countDocuments({});
    if (count === 0) {
      let creatorUser = await User.findOne({ role: "super_admin" });
      if (!creatorUser) {
        creatorUser = await User.findOne({});
      }

      if (creatorUser) {
        const seeded = defaultTopics.map((t) => ({ ...t, user: creatorUser!._id, approvalStatus: "approved" }));
        await DiscussionTopic.insertMany(seeded);
      }
    }

    // Since GET is public or might require auth, we check if req.user exists
    // The NextAuth GET allowed fetching even if not logged in (user might be null)
    // Wait, let's just assume auth is optional for GET, we can decode token manually if needed.
    // For now, let's just try to decode it safely without throwing
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const canModerate = user && hasPermission(user.role as any, "content:moderate");
    const filter: Record<string, unknown> = {
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
    };
    if (category) {
      filter.category = category;
    }

    const topics = await DiscussionTopic.find(filter)
      .populate("user", "name profilePhoto role")
      .populate("replies.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    res.json(topics);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Discussions fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    const action = req.query.action as string;
    const body = req.body;

    // 1. Create a new topic
    if (!action) {
      const { title, content, category } = body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newTopic = await DiscussionTopic.create({
        title,
        content,
        user: userObj.id,
        churchId: userObj.churchId || undefined,
        category,
        approvalStatus: hasPermission(userObj.role, "content:moderate") ? "approved" : "pending",
        replies: [],
        likes: [],
        bookmarks: [],
      });

      const populated = await newTopic.populate("user", "name profilePhoto role");
      return res.status(201).json(populated);
    }

    const { topicId } = body;
    if (!topicId) {
      return res.status(400).json({ error: "Topic ID is required" });
    }

    const topic = await DiscussionTopic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: "Discussion topic not found" });
    }

    // 2. Add Reply
    if (action === "reply") {
      const { content } = body;
      if (!content) {
        return res.status(400).json({ error: "Reply content is required" });
      }

      topic.replies.push({
        user: userObj.id,
        content,
        createdAt: new Date(),
      } as any);

      await topic.save();
      const updated = await DiscussionTopic.findById(topicId)
        .populate("user", "name profilePhoto role")
        .populate("replies.user", "name profilePhoto role");

      return res.json(updated);
    }

    // 3. Toggle Like
    if (action === "like") {
      const userId = userObj.id;
      const index = topic.likes.findIndex((id) => id.toString() === userId);

      if (index === -1) {
        topic.likes.push(new mongoose.Types.ObjectId(userId) as any);
      } else {
        topic.likes.splice(index, 1);
      }

      await topic.save();
      const updated = await DiscussionTopic.findById(topicId)
        .populate("user", "name profilePhoto role")
        .populate("replies.user", "name profilePhoto role");

      return res.json(updated);
    }

    // 4. Toggle Bookmark
    if (action === "bookmark") {
      const userId = userObj.id;
      const index = topic.bookmarks.findIndex((id) => id.toString() === userId);

      if (index === -1) {
        topic.bookmarks.push(new mongoose.Types.ObjectId(userId) as any);
      } else {
        topic.bookmarks.splice(index, 1);
      }

      await topic.save();
      const updated = await DiscussionTopic.findById(topicId)
        .populate("user", "name profilePhoto role")
        .populate("replies.user", "name profilePhoto role");

      return res.json(updated);
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Discussion action failed", details: error.message });
  }
});

export default router;
