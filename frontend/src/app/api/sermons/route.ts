import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Sermon from "@/backend/models/Sermon";
import { SermonSchema, formatZodError } from "@/lib/validators";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const sermons = await Sermon.find({ approvalStatus: 'approved', deletedAt: null })
      .sort({ date: -1 })
      .limit(20)
      .exec();
    return NextResponse.json(sermons, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized. Admin or SuperAdmin role required." }, { status: 403 });
    }

    const body = await req.json();

    // Validate with Zod
    const parsed = SermonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { title, speaker, date, description, audioUrl, videoUrl, category } = parsed.data;
    const { notes } = body;

    const sermon = await Sermon.create({
      title,
      speaker,
      date: new Date(date),
      description,
      audioUrl,
      videoUrl,
      notes,
      category: category || "Sermon",
      uploadedBy: session.user.id,
      churchId: session.user.churchId || undefined,
      approvalStatus: 'approved',
    });

    return NextResponse.json(sermon, { status: 201 });
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

    await Sermon.findByIdAndUpdate(id, { deletedAt: new Date() });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
