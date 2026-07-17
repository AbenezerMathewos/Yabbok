import { NextResponse } from "next/server";
import { requireAnyPermission, handleApiError } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { createEvent, listEvents } from "@/backend/events/eventService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("includeAll") === "true";

    let shouldIncludeAll = false;
    if (includeAll) {
      const session = await getServerSession(authOptions);
      const user = session?.user as any;
      if (user && ["super_admin", "admin", "moderator", "church_leader"].includes(user.role)) {
        shouldIncludeAll = true;
      }
    }

    const events = await listEvents(shouldIncludeAll);
    return NextResponse.json(events);
  } catch (error: unknown) {
    return handleApiError(error, "Events fetch failed");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAnyPermission(["event:create:any", "event:create:own"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can create events." }, { status: 403 });
    }

    const body = await req.json();
    const newEvent = await createEvent({
      ...body,
      organizer: user.id,
      churchId: user.role === "super_admin" || user.role === "admin" ? body.churchId : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("event fields")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("live platform")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleApiError(error, "Event creation failed");
  }
}
