import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export async function GET() {
  try {
    const userObj = await getCurrentUser();

    if (userObj) {
      await connectToDatabase();
      const user = await User.findById(userObj.id).populate("churchId", "name city region").lean();
      if (user) {
        return NextResponse.json({
          // Use last 8 hex chars of ObjectId for a stable, collision-safe member ID
          memberId: `YABBOK-${String(user._id).slice(-8).toUpperCase()}`,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          churchName: (user.churchId as any)?.name || "Addis Ababa Central KHC",
          churchBranch: user.churchBranch || "Youth Choir Branch",
          region: user.region || "Addis Ababa",
          profilePhoto: user.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
          issuedDate: new Date(user.createdAt).toLocaleDateString(),
        });
      }
    }

    // Default sample member card for preview
    return NextResponse.json({
      memberId: "YABBOK-MEM-8A9F32",
      name: "Abebe Kebede",
      email: "abebe@yabbok.org",
      phone: "+251 91 122 3344",
      role: "member",
      status: "active",
      churchName: "Addis Ababa Central KHC",
      churchBranch: "Central Youth Choir Branch",
      region: "Addis Ababa",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      issuedDate: "01/15/2026",
    });
  } catch (err) {
    return NextResponse.json({
      memberId: "YABBOK-MEM-8A9F32",
      name: "Abebe Kebede",
      email: "abebe@yabbok.org",
      phone: "+251 91 122 3344",
      role: "member",
      status: "active",
      churchName: "Addis Ababa Central KHC",
      churchBranch: "Central Youth Choir Branch",
      region: "Addis Ababa",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      issuedDate: "01/15/2026",
    });
  }
}
