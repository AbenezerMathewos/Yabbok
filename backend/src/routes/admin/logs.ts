import express from 'express';
import { requireAuth } from '../../middleware/auth';
import AuditLog from '../../models/AuditLog';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const adminUser = req.user;
    // Audit logs are visible only to the Super Admin role
    if (adminUser.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Super Admin only" });
    }

    const logs = await AuditLog.find({})
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error: any) {
    console.error("Admin logs fetch error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
