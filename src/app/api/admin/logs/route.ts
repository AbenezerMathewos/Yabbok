import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import AuditLog from "@/backend/models/AuditLog";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = session.user as any;
    // Audit logs are visible only to the Super Admin role
    if (adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    await connectToDatabase();

    const logs = await AuditLog.find({})
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Admin logs fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
