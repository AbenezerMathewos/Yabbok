import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import MentorProfile from "@/backend/models/MentorProfile";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await MentorProfile.findOne({ user: session.user.id });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { expertise, maxMentees, bio } = body;

    if (!expertise || expertise.length === 0) {
      return NextResponse.json({ error: "Expertise is required" }, { status: 400 });
    }

    let profile = await MentorProfile.findOne({ user: session.user.id });

    if (profile) {
      profile.expertise = expertise;
      profile.maxMentees = maxMentees || 3;
      profile.bio = bio || "";
      await profile.save();
    } else {
      profile = await MentorProfile.create({
        user: session.user.id,
        expertise,
        maxMentees: maxMentees || 3,
        bio: bio || "",
        isApproved: false, // Must be approved by admin
      });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
