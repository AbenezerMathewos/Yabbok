import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireUser } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import DiscussionTopic from "@/backend/models/DiscussionTopic";
import User from "@/backend/models/User";
import mongoose from "mongoose";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    await connectToDatabase();

    // Auto-seed if empty
    const count = await DiscussionTopic.countDocuments({});
    if (count === 0) {
      // Find a user to act as creator if possible, else create a dummy
      let creatorUser = await User.findOne({ role: "super_admin" });
      if (!creatorUser) {
        creatorUser = await User.findOne({});
      }

      if (creatorUser) {
        const seeded = defaultTopics.map((t) => ({ ...t, user: creatorUser!._id, approvalStatus: "approved" }));
        await DiscussionTopic.insertMany(seeded);
      }
    }

    const user = await getCurrentUser();
    const canModerate = user && hasPermission(user.role, "content:moderate");
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

    return NextResponse.json(topics);
  } catch (error) {
    return handleApiError(error, "Discussions fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    await connectToDatabase();

    // 1. Create a new topic
    if (!action) {
      const { title, content, category } = body;
      if (!title || !content || !category) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      return NextResponse.json(populated, { status: 201 });
    }

    // Target topic ID is required for actions
    const { topicId } = body;
    if (!topicId) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 });
    }

    const topic = await DiscussionTopic.findById(topicId);
    if (!topic) {
      return NextResponse.json({ error: "Discussion topic not found" }, { status: 404 });
    }

    // 2. Add Reply
    if (action === "reply") {
      const { content } = body;
      if (!content) {
        return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
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

      return NextResponse.json(updated);
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

      return NextResponse.json(updated);
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

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "Discussion action failed");
  }
}
