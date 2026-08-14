import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import MentorProfile from "@/backend/models/MentorProfile";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'super_admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const isApproved = status === "approved"; // true for approved, false for pending

    const mentorProfiles = await MentorProfile.find({ isApproved })
      .populate({ path: "user", model: User, select: "name email role" })
      .exec();

    const formattedQueue = mentorProfiles.map(p => ({
      type: "mentor_profiles",
      item: {
        _id: p._id,
        user: p.user,
        title: "Mentor Profile Application",
        content: `Expertise: ${p.expertise.join(", ")} | Bio: ${p.bio}`,
      }
    }));

    return NextResponse.json(formattedQueue, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'super_admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id, status, note } = await req.json();

    if (type === "mentor_profiles") {
      if (status === "approved") {
        await MentorProfile.findByIdAndUpdate(id, { isApproved: true });
      } else if (status === "rejected") {
        await MentorProfile.findByIdAndDelete(id); // Reject by deleting profile
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Type not supported yet" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
