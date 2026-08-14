import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import MentorProfile from "@/backend/models/MentorProfile";
import User from "@/backend/models/User"; // Need to ensure User is loaded

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only get approved and available mentors, and populate their User details
    const mentors = await MentorProfile.find({
      isApproved: true,
      isAvailable: true,
    })
      .populate({
        path: "user",
        model: User,
        select: "name email churchBranch region profilePhoto educationalStatus bio",
      })
      .exec();

    return NextResponse.json(mentors, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
