import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import GalleryItem from '../models/GalleryItem';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const category = req.query.category as string;
    const canModerate = user && hasPermission(user.role as any, "content:moderate");

    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
      ...(category && category !== "all" ? { category } : {}),
    };

    if (!canModerate && user && hasPermission(user.role as any, "media:manage")) {
      query.approvalStatus = { $in: ["approved", "pending"] };
    }

    const items = await GalleryItem.find(query)
      .populate("uploadedBy", "name")
      .populate("churchId", "name city")
      .sort({ date: -1 });

    res.json(items);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Gallery fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { title, description, category, imageUrl, churchId, date } = req.body;

    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "Title, category, and image are required" });
    }

    const item = await GalleryItem.create({
      title,
      description: description || "",
      category,
      imageUrl,
      uploadedBy: user.id,
      churchId: hasPermission(user.role, "media:manage") ? churchId || user.churchId || undefined : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Gallery create failed", details: error.message });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage") && !hasPermission(user.role, "content:moderate")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Gallery Item ID is required" });
    }

    await GalleryItem.findByIdAndUpdate(id, { deletedAt: new Date(), approvalStatus: "archived" });
    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Gallery delete failed", details: error.message });
  }
});

export default router;
