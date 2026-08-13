import express from 'express';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// GET — get current user's full profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -verificationToken -resetToken -resetTokenExpiry")
      .populate("churchId", "name city region");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT — update current user's profile
router.put('/', requireAuth, async (req, res) => {
  try {
    const body = req.body;

    // Only allow safe fields to be updated
    const allowed = ["name", "phone", "bio", "profilePhoto", "ministryAreas", "educationalStatus", "region", "churchBranch"];
    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        update[key] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password -verificationToken -resetToken -resetTokenExpiry");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
