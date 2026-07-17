import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError, requireAnyPermission } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Book from "@/backend/models/Book";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const canModerate = Boolean(user && hasPermission(user.role, "content:moderate"));

    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
      ...(category && category !== "all" ? { category } : {}),
    };

    const items = await Book.find(query)
      .populate("uploadedBy", "name")
      .populate("churchId", "name city")
      .sort({ createdAt: -1 });

    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error, "Books fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAnyPermission(["media:manage"]);
    await connectToDatabase();
    const body = await req.json();
    const { title, author, description, coverUrl, pdfUrl, category, churchId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const item = await Book.create({
      title,
      author: author || "",
      description: description || "",
      coverUrl: coverUrl || "",
      pdfUrl: pdfUrl || "",
      category: category || "Book",
      uploadedBy: user.id,
      churchId: hasPermission(user.role, "media:manage") ? churchId || user.churchId || undefined : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Book create failed");
  }
}
