import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requireAnyPermission } from "@/backend/auth/session";
import Sermon from "@/backend/models/Sermon";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, ctx: RouteContext) {
  try {
    const user = await requireAnyPermission(["media:manage"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can update sermons." }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    await connectToDatabase();

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    const allowedFields = ["title", "speaker", "date", "description", "audioUrl", "videoUrl", "notes", "category"];
    for (const key of allowedFields) {
      if (key in body) {
        (sermon as any)[key] = body[key];
      }
    }

    if ("date" in body) sermon.date = new Date(body.date);

    if (user.role === "super_admin") {
      if (body.approvalStatus) {
        sermon.approvalStatus = body.approvalStatus;
      }
    } else {
      sermon.approvalStatus = "pending";
    }

    await sermon.save();
    return NextResponse.json(sermon);
  } catch (error) {
    return handleApiError(error, "Sermon update failed");
  }
}

export async function DELETE(req: Request, ctx: RouteContext) {
  try {
    const user = await requireAnyPermission(["media:manage"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can delete sermons." }, { status: 403 });
    }

    const { id } = await ctx.params;

    await connectToDatabase();

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }

    sermon.deletedAt = new Date();
    await sermon.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Sermon deletion failed");
  }
}
