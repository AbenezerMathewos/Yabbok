import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireUser } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import MutualAid from "@/backend/models/MutualAid";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'need' or 'offer'

    await connectToDatabase();
    
    // Default: fetch open or in-progress posts
    const query: any = {
      status: { $in: ["open", "in_progress"] },
    };

    if (type === "need" || type === "offer") {
      query.type = type;
    }

    const posts = await MutualAid.find(query)
      .populate("user", "name profilePhoto")
      .populate("fulfilledBy", "name profilePhoto")
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    return handleApiError(error, "Failed to fetch mutual aid posts");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    const body = await req.json();

    const { type, category, title, description } = body;

    if (!type || !category || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newPost = await MutualAid.create({
      user: userObj.id,
      churchId: userObj.churchId || undefined,
      type,
      category,
      title,
      description,
      status: "open",
    });

    const populated = await newPost.populate("user", "name profilePhoto");
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create mutual aid post");
  }
}

export async function PATCH(req: Request) {
  try {
    const userObj = await requireUser();
    const body = await req.json();

    const { postId, status } = body;

    if (!postId || !status) {
      return NextResponse.json({ error: "Missing postId or status" }, { status: 400 });
    }

    await connectToDatabase();

    const post = await MutualAid.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Determine permissions (only author can edit everything, or admin/superadmin, or someone volunteering to help)
    // For now, let's keep it simple: if setting to "in_progress", the current user is volunteering
    if (status === "in_progress" && post.status === "open") {
      post.status = "in_progress";
      post.fulfilledBy = new mongoose.Types.ObjectId(userObj.id) as any;
    } else if (post.user.toString() === userObj.id || userObj.role === "moderator" || userObj.role === "super_admin") {
      // Author/Admin can change status to whatever
      post.status = status;
    } else {
      return NextResponse.json({ error: "Unauthorized to update this post" }, { status: 403 });
    }

    await post.save();
    
    const updatedPost = await MutualAid.findById(postId)
      .populate("user", "name profilePhoto")
      .populate("fulfilledBy", "name profilePhoto");

    return NextResponse.json(updatedPost);
  } catch (error) {
    return handleApiError(error, "Failed to update mutual aid post");
  }
}
