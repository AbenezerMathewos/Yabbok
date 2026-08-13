import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireUser } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Suggestion from "@/backend/models/Suggestion";

export async function GET() {
  try {
    const userObj = await getCurrentUser();
    if (!userObj) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let suggestions;
    // Admins and moderators see all suggestions. Members see only their own submissions.
    if (hasPermission(userObj.role, "content:moderate")) {
      suggestions = await Suggestion.find({ deletedAt: { $exists: false } })
        .populate("user", "name email phone churchBranch")
        .sort({ createdAt: -1 });
    } else {
      suggestions = await Suggestion.find({ user: userObj.id, deletedAt: { $exists: false } })
        .populate("user", "name email phone churchBranch")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error, "Suggestions fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();

    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newSuggestion = await Suggestion.create({
      user: userObj.id,
      title,
      content,
      category: category || "Other",
      churchId: userObj.churchId || undefined,
      status: "review",
    });

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Suggestion submission failed");
  }
}

export async function PUT(req: Request) {
  try {
    const userObj = await requireUser();
    if (!hasPermission(userObj.role, "content:moderate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { suggestionId, status } = body;

    if (!suggestionId || !status) {
      return NextResponse.json({ error: "Suggestion ID and status are required" }, { status: 400 });
    }

    if (!["review", "approved", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    const suggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    return handleApiError(error, "Suggestion status update failed");
  }
}
