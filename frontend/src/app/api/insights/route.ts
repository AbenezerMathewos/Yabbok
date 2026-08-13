import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Insight from "@/backend/models/Insight";
import User from "@/backend/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const insights = await Insight.find({})
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("Insights fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObj = session.user as any;
    if (userObj.status !== "active") {
      return NextResponse.json({ error: "Account not active. Await leadership approval." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    await connectToDatabase();

    // 1. Create Devotional / Lesson Learned
    if (!action) {
      const { content, bibleReferences } = body;
      if (!content) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
      }

      const newInsight = await Insight.create({
        user: userObj.id,
        content,
        bibleReferences: bibleReferences || [],
        reactions: [],
        comments: [],
      });

      const populated = await newInsight.populate("user", "name profilePhoto role");
      return NextResponse.json(populated, { status: 201 });
    }

    // For actions, target insight ID is required
    const { insightId } = body;
    if (!insightId) {
      return NextResponse.json({ error: "Insight ID is required" }, { status: 400 });
    }

    const insight = await Insight.findById(insightId);
    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
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

      return NextResponse.json(updatedInsight);
    }

    // 3. React
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
      }

      const userId = userObj.id;
      insight.reactions = insight.reactions.filter((r) => r.user.toString() !== userId);
      insight.reactions.push({
        user: userId,
        type,
      } as any);

      await insight.save();
      const updatedInsight = await Insight.findById(insightId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return NextResponse.json(updatedInsight);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Insight action error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
