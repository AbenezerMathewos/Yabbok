import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { handleApiError, requireAnyPermission } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import Event from "@/backend/models/Event";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, ctx: RouteContext) {
  try {
    const user = await requireAnyPermission(["event:create:any", "event:create:own"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can update events." }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    await connectToDatabase();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const allowedFields = [
      "title", "description", "category", "date", "endDate", 
      "location", "isLive", "liveMeetingUrl", "livePlatform",
      "photoAdUrl", "videoAdUrl", "voiceAdUrl"
    ];

    for (const key of allowedFields) {
      if (key in body) {
        (event as any)[key] = body[key];
      }
    }

    if ("date" in body) event.date = new Date(body.date);
    if ("endDate" in body) event.endDate = body.endDate ? new Date(body.endDate) : undefined;

    if (user.role === "super_admin") {
      if (body.approvalStatus) {
        event.approvalStatus = body.approvalStatus;
      }
    } else {
      event.approvalStatus = "pending";
    }

    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    return handleApiError(error, "Event update failed");
  }
}

export async function DELETE(req: Request, ctx: RouteContext) {
  try {
    const user = await requireAnyPermission(["event:create:any", "event:create:own"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can delete events." }, { status: 403 });
    }

    const { id } = await ctx.params;

    await connectToDatabase();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    event.deletedAt = new Date();
    await event.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "Event deletion failed");
  }
}
