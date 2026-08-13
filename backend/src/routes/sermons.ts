import express from 'express';
import { requireAuth } from '../middleware/auth';
import { hasPermission } from '../auth/roles';
import Sermon from '../models/Sermon';

const router = express.Router();

const defaultSermons = [
  {
    title: "Walking in Faith and Victory (በእምነትና በድል መመላለስ)",
    speaker: "Pastor Abraham G/Mariam",
    date: new Date("2026-05-24"),
    description: "A powerful message on how to overcome youth struggles, keeping your eyes on Christ amidst cultural challenges.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    notes: "Key verses: Hebrews 11:1-6, Proverbs 3:5-6. Faith is not just a belief but a daily lifestyle. Trust in Him.",
    category: "Youth Empowerment",
  },
  {
    title: "Living a Sanctified Youth Life (የተቀደሰ የወጣትነት ህይወት)",
    speaker: "Sister Selamawit Kassa",
    date: new Date("2026-05-17"),
    description: "An inspiring teaching about maintaining Christian purity, peer-pressure resilience, and service in local ministries.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    videoUrl: "",
    notes: "Main point: Keep your path pure by living according to God's Word. Reading: Psalm 119:9, 1 Timothy 4:12.",
    category: "Holiness",
  },
  {
    title: "Understanding Your Calling (ጥሪህን ማስተዋል)",
    speaker: "Evangelist Dawit Yohannes",
    date: new Date("2026-05-10"),
    description: "Discovering your spiritual gifts and service area inside Kale Hiywet Church and in the world.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    notes: "Summary: You are created for good works prepared in advance. Key scriptures: Ephesians 2:10, Romans 12:4-8.",
    category: "Calling & Service",
  },
];

// GET /api/sermons
router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const user = await getToken({ req, secret });

    const includeAll = req.query.includeAll === "true";
    let query: any = { deletedAt: { $exists: false } };

    if (includeAll) {
      const isAdminOrSuperAdmin = user && ["super_admin", "admin", "moderator", "church_leader"].includes(user.role as string);
      if (!isAdminOrSuperAdmin) {
        query.approvalStatus = "approved";
      }
    } else {
      query.approvalStatus = "approved";
    }

    let sermons = await Sermon.find(query).sort({ date: -1 });

    if (sermons.length === 0 && !includeAll) {
      await Sermon.insertMany(
        defaultSermons.map((sermon) => ({ ...sermon, approvalStatus: "approved" }))
      );
      sermons = await Sermon.find({ approvalStatus: "approved", deletedAt: { $exists: false } }).sort({ date: -1 });
    }

    res.json(sermons);
  } catch (error: any) {
    console.error("Sermons fetch error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// POST /api/sermons
router.post('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can upload sermons." });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can upload sermons." });
    }

    const { title, speaker, date, description, audioUrl, videoUrl, notes, category, churchId } = req.body;

    if (!title || !speaker || !date || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSermon = await Sermon.create({
      title,
      speaker,
      date: new Date(date),
      description,
      audioUrl: audioUrl || "",
      videoUrl: videoUrl || "",
      notes: notes || "",
      category: category || "Sermon",
      uploadedBy: user.id,
      churchId: churchId || undefined,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    res.status(201).json(newSermon);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Sermon creation failed", details: error.message });
  }
});

// PUT /api/sermons/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can update sermons." });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can update sermons." });
    }

    const { id } = req.params;
    const body = req.body;

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return res.status(404).json({ error: "Sermon not found" });
    }

    const allowedFields = ["title", "speaker", "date", "description", "audioUrl", "videoUrl", "notes", "category"];
    for (const key of allowedFields) {
      if (key in body) {
        (sermon as any)[key] = body[key];
      }
    }

    if ("date" in body) sermon.date = new Date(body.date);

    if (user.role === "super_admin") {
      if (body.approvalStatus) {
        sermon.approvalStatus = body.approvalStatus;
      }
    } else {
      sermon.approvalStatus = "pending";
    }

    await sermon.save();
    res.json(sermon);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Sermon update failed", details: error.message });
  }
});

// DELETE /api/sermons/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!hasPermission(user.role, "media:manage")) {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can delete sermons." });
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Only admins and super admins can delete sermons." });
    }

    const { id } = req.params;

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return res.status(404).json({ error: "Sermon not found" });
    }

    sermon.deletedAt = new Date();
    await sermon.save();

    res.json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Sermon deletion failed", details: error.message });
  }
});

export default router;
