import express from 'express';
import { requireAuth } from '../middleware/auth';
import Notification from '../models/Notification';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const notifications = await Notification.find({ user: user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Notifications fetch failed", details: error.message });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { notificationId, read = true } = req.body;

    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: user.id },
      { read },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Notification update failed", details: error.message });
  }
});

export default router;
