import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { hasPermission, isRole, isUserStatus } from '../../auth/roles';
import User from '../../models/User';
import AuditLog from '../../models/AuditLog';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    if (!hasPermission(userObj.role, "user:manage:any") && !hasPermission(userObj.role, "user:manage:church") && !hasPermission(userObj.role, "user:approve")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const query: Record<string, string> = {};
    // Church leaders can only see users belonging to their own church branch
    if (!hasPermission(userObj.role, "user:manage:any") && userObj.churchId) {
      query.churchId = userObj.churchId;
    }

    const users = await User.find(query)
      .populate("churchId", "name city region")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Admin fetch users failed", details: error.message });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const adminUser = req.user;
    if (!hasPermission(adminUser.role, "user:manage:any") && !hasPermission(adminUser.role, "user:manage:church") && !hasPermission(adminUser.role, "user:approve")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { userId, role, status, suspensionReason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify church leader authorization boundary (cannot edit user of another church)
    if (!hasPermission(adminUser.role, "user:manage:any") && targetUser.churchId?.toString() !== adminUser.churchId?.toString()) {
      return res.status(403).json({ error: "Forbidden: Cannot manage members from other churches" });
    }

    // Capture audit details
    let auditDetails = "";
    const updatePayload: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!hasPermission(adminUser.role, "user:approve") && !hasPermission(adminUser.role, "user:manage:any")) {
        return res.status(403).json({ error: "Forbidden: Missing user approval permission" });
      }

      // Validate transitions
      if (!isUserStatus(status)) {
        return res.status(400).json({ error: "Invalid status" });
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
        return res.status(403).json({ error: "Forbidden: Only super admin can change user roles" });
      }
      if (!isRole(role)) {
        return res.status(400).json({ error: "Invalid role" });
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

    res.json(updatedUser);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Admin user update failed", details: error.message });
  }
});

export default router;
