import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireAnyPermission } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import GalleryItem from "@/backend/models/GalleryItem";

// GET — list all gallery items, optionally filter by category
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const canModerate = user && hasPermission(user.role, "content:moderate");
    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
      ...(category && category !== "all" ? { category } : {}),
    };

    if (!canModerate && user && hasPermission(user.role, "media:manage")) {
      query.approvalStatus = { $in: ["approved", "pending"] };
    }
    const items = await GalleryItem.find(query)
      .populate("uploadedBy", "name")
      .populate("churchId", "name city")
      .sort({ date: -1 });
    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error, "Gallery fetch failed");
  }
}

// POST — admin adds a new gallery item
export async function POST(req: Request) {
  try {
    const user = await requireAnyPermission(["media:manage"]);

    await connectToDatabase();
    const body = await req.json();
    const { title, description, category, imageUrl, churchId, date } = body;

    if (!title || !category || !imageUrl) {
      return NextResponse.json({ error: "Title, category, and image are required" }, { status: 400 });
    }

    const item = await GalleryItem.create({
      title,
      description: description || "",
      category,
      imageUrl,
      uploadedBy: user.id,
      churchId: hasPermission(user.role, "media:manage") ? churchId || user.churchId || undefined : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Gallery create failed");
  }
}

// DELETE — admin removes a gallery item
export async function DELETE(req: Request) {
  try {
    await requireAnyPermission(["media:manage", "content:moderate"]);

    await connectToDatabase();
    const { id } = await req.json();
    await GalleryItem.findByIdAndUpdate(id, { deletedAt: new Date(), approvalStatus: "archived" });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Gallery delete failed");
  }
}
