import { NextResponse } from "next/server";
import { requireAnyPermission, requireUser, handleApiError } from "@/backend/auth/session";
import { hasPermission, isRole, isUserStatus } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import AuditLog from "@/backend/models/AuditLog";

export async function GET() {
  try {
    const userObj = await requireAnyPermission(["user:manage:any", "user:manage:church", "user:approve"]);

    await connectToDatabase();

    const query: Record<string, string> = {};
    // Church leaders can only see users belonging to their own church branch
    if (!hasPermission(userObj.role, "user:manage:any") && userObj.churchId) {
      query.churchId = userObj.churchId;
    }

    const users = await User.find(query)
      .populate("churchId", "name city region")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error, "Admin fetch users failed");
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await requireUser();

    const body = await req.json();
    const { userId, role, status, suspensionReason } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify church leader authorization boundary (cannot edit user of another church)
    if (!hasPermission(adminUser.role, "user:manage:any") && targetUser.churchId?.toString() !== adminUser.churchId) {
      return NextResponse.json({ error: "Forbidden: Cannot manage members from other churches" }, { status: 403 });
    }

    // Capture audit details
    let auditDetails = "";
    const updatePayload: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!hasPermission(adminUser.role, "user:approve") && !hasPermission(adminUser.role, "user:manage:any")) {
        return NextResponse.json({ error: "Forbidden: Missing user approval permission" }, { status: 403 });
      }

      // Validate transitions
      if (!isUserStatus(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      
      // Church leaders can verify, but only Super Admins can fully approve to "active"
      if (adminUser.role === "church_leader" && status === "active") {
        updatePayload.status = "verified_by_leader";
        auditDetails += `Status verified by Church Leader (from ${targetUser.status} to verified_by_leader). `;
      } else {
        updatePayload.status = status;
        if (status === "active") {
          updatePayload.approvedBy = adminUser.id;
          updatePayload.approvedAt = new Date();
        }
        if (status === "suspended") {
          updatePayload.suspensionReason = suspensionReason || "";
        }
        auditDetails += `Status changed from ${targetUser.status} to ${status}. `;
      }
    }

    if (role !== undefined) {
      // Only Super Admin can change user roles
      if (!hasPermission(adminUser.role, "user:assign-role")) {
        return NextResponse.json({ error: "Forbidden: Only super admin can change user roles" }, { status: 403 });
      }
      if (!isRole(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updatePayload.role = role;
      auditDetails += `Role changed from ${targetUser.role} to ${role}. `;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, { new: true })
      .populate("churchId", "name");

    // Write audit log entry
    await AuditLog.create({
      actor: adminUser.id,
      action: "USER_MODERATION",
      targetId: targetUser._id,
      targetType: "User",
      details: auditDetails || "User updated with no changes",
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error, "Admin user update failed");
  }
}
