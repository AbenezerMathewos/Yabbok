import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { hasPermission } from '../../auth/roles';
import AuditLog from '../../models/AuditLog';
import Report from '../../models/Report';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const admin = req.user;
    if (!hasPermission(admin.role, "content:report:view")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const reports = await Report.find({})
      .populate("reporter", "name email churchBranch")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(reports);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Reports fetch failed", details: error.message });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  try {
    const admin = req.user;
    if (!hasPermission(admin.role, "content:report:view")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { reportId, status, resolutionNote } = req.body;

    if (!reportId || !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ error: "Invalid report update" });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, assignedTo: admin.id, resolutionNote: resolutionNote || "" },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    await AuditLog.create({
      actor: admin.id,
      action: "REPORT_REVIEW",
      targetId: report._id,
      targetType: "Report",
      details: `Report marked ${status}${resolutionNote ? `: ${resolutionNote}` : ""}`,
    });

    res.json(report);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Report update failed", details: error.message });
  }
});

export default router;
