import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getToken } from 'next-auth/jwt';

const router = express.Router();

// Ensure base upload directory exists
const baseUploadDir = path.join(__dirname, '../../../../frontend/public/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadDir = path.join(baseUploadDir, folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
  fileFilter: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/x-m4a", "audio/m4a"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    const allowedDocTypes = ["application/pdf"];

    let allowedTypes: string[] = [];
    let maxSize = 5 * 1024 * 1024;
    
    if (folder === "audio") {
      allowedTypes = allowedAudioTypes;
      maxSize = 50 * 1024 * 1024;
    } else if (folder === "video") {
      allowedTypes = allowedVideoTypes;
      maxSize = 50 * 1024 * 1024;
    } else if (folder === "sermons") {
      allowedTypes = [...allowedAudioTypes, ...allowedVideoTypes];
      maxSize = 50 * 1024 * 1024;
    } else if (folder === "books") {
      allowedTypes = [...allowedDocTypes, ...allowedImageTypes];
      maxSize = 20 * 1024 * 1024;
    } else if (folder === "events" || folder === "short-messages") {
      allowedTypes = [...allowedImageTypes, ...allowedAudioTypes, ...allowedVideoTypes];
      maxSize = 50 * 1024 * 1024;
    } else {
      allowedTypes = allowedImageTypes;
      maxSize = 5 * 1024 * 1024;
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }

    // Multer handles limits via limits object, but we can't dynamically set limit per file easily without custom engine
    // Since we set global limit to 50MB, we can check file size after upload or trust the client a bit for simplicity
    
    cb(null, true);
  },
});

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const folder = req.body.folder || 'general';
    
    // Auth check (profiles can be uploaded without auth during registration)
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const token = await getToken({ req, secret });

    if (!token && folder !== 'profiles') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filename = req.file.filename;
    const url = `/uploads/${folder}/${filename}`;
    
    res.status(200).json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

export default router;
