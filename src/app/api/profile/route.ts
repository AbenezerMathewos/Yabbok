import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

// GET — get current user's full profile
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(sessionUser.id)
      .select("-password -verificationToken -resetToken -resetTokenExpiry")
      .populate("churchId", "name city region");

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — update current user's profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await req.json();

    // Only allow safe fields to be updated
    const allowed = ["name", "phone", "bio", "profilePhoto", "ministryAreas", "educationalStatus", "region", "churchBranch"];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        update[key] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      sessionUser.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password -verificationToken -resetToken -resetTokenExpiry");

    if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
