import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireUser } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Testimony from "@/backend/models/Testimony";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    const canModerate = user && hasPermission(user.role, "content:moderate");
    const testimonies = await Testimony.find({
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
    })
      .populate("user", "name profilePhoto role")
      .populate("comments.user", "name profilePhoto role")
      .sort({ createdAt: -1 });

    return NextResponse.json(testimonies);
  } catch (error) {
    return handleApiError(error, "Testimonies fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    await connectToDatabase();

    // 1. Create a new Testimony
    if (!action) {
      const { title, content, media } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Title and Content are required" }, { status: 400 });
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
      return NextResponse.json(populated, { status: 201 });
    }

    // For actions, target testimony ID is required
    const { testimonyId } = body;
    if (!testimonyId) {
      return NextResponse.json({ error: "Testimony ID is required" }, { status: 400 });
    }

    const testimony = await Testimony.findById(testimonyId);
    if (!testimony) {
      return NextResponse.json({ error: "Testimony not found" }, { status: 404 });
    }

    // 2. Add Comment
    if (action === "comment") {
      const { content } = body;
      if (!content) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
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

      return NextResponse.json(updatedTestimony);
    }

    // 3. React
    if (action === "react") {
      const { type } = body;
      if (!type) {
        return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
      }

      const userId = userObj.id;
      testimony.reactions = testimony.reactions.filter((r) => r.user.toString() !== userId);
      testimony.reactions.push({
        user: userId,
        type,
      } as any);

      await testimony.save();
      const updatedTestimony = await Testimony.findById(testimonyId)
        .populate("user", "name profilePhoto role")
        .populate("comments.user", "name profilePhoto role");

      return NextResponse.json(updatedTestimony);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "Testimony action failed");
  }
}
