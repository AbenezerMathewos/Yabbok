import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import Book from '../models/Book';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const category = req.query.category as string;
    const canModerate = Boolean(user && hasPermission(user.role as any, "content:moderate"));

    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
      ...(canModerate ? {} : { approvalStatus: "approved" }),
      ...(category && category !== "all" ? { category } : {}),
    };

    const items = await Book.find(query)
      .populate("uploadedBy", "name")
      .populate("churchId", "name city")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Books fetch failed", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage")) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    const { title, author, description, coverUrl, pdfUrl, category, churchId } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const item = await Book.create({
      title,
      author: author || "",
      description: description || "",
      coverUrl: coverUrl || "",
      pdfUrl: pdfUrl || "",
      category: category || "Book",
      uploadedBy: user.id,
      churchId: hasPermission(user.role, "media:manage") ? churchId || user.churchId || undefined : user.churchId,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Book create failed", details: error.message });
  }
});

export default router;
