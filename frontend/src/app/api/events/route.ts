import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Event from "@/backend/models/Event";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    // Public route for approved upcoming/past events
    const events = await Event.find({ approvalStatus: 'approved', deletedAt: null })
      .sort({ date: 1 })
      .exec();

    return NextResponse.json(events, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    // RBAC: strictly admin or super_admin
    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized. Admin or SuperAdmin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, date, endDate, location, isLive, photoAdUrl, videoAdUrl, voiceAdUrl } = body;

    if (!title || !description || !category || !date || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      isLive: Boolean(isLive),
      photoAdUrl,
      videoAdUrl,
      voiceAdUrl,
      organizer: session.user.id,
      churchId: session.user.churchId || undefined,
      approvalStatus: 'approved' // Auto-approved since uploaded by admin
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await Event.findByIdAndUpdate(id, { deletedAt: new Date() });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
