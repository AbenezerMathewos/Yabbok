import express from 'express';
import { requireAuth } from '../middleware/auth';
import Report from '../models/Report';

const router = express.Router();

const REPORTABLE_TYPES = ["PrayerRequest", "Testimony", "DiscussionTopic", "GalleryItem", "Sermon", "Event", "User"];

router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { targetType, targetId, reason, details } = req.body;

    if (!REPORTABLE_TYPES.includes(targetType) || !targetId || !reason) {
      return res.status(400).json({ error: "Target and reason are required" });
    }

    const report = await Report.create({
      reporter: user.id,
      targetType,
      targetId,
      reason,
      details: details || "",
    });

    res.status(201).json(report);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Report submission failed", details: error.message });
  }
});

export default router;
