import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    const session = await getServerSession(authOptions);
    if (!session?.user && folder !== "profiles") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size by folder
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/x-m4a", "audio/m4a"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
    const allowedDocTypes = ["application/pdf"];

    let allowedTypes: string[] = [];
    let maxSize = 5 * 1024 * 1024; // default 5MB
    let typeMessage = "Only image files are allowed (JPG, PNG, WEBP, GIF).";

    if (folder === "audio") {
      allowedTypes = allowedAudioTypes;
      maxSize = 50 * 1024 * 1024; // 50MB
      typeMessage = "Only audio files are allowed (MP3, WAV, WEBM, OGG, M4A).";
    } else if (folder === "video") {
      allowedTypes = allowedVideoTypes;
      maxSize = 50 * 1024 * 1024; // 50MB
      typeMessage = "Only video files are allowed (MP4, WEBM, OGG, MOV).";
    } else if (folder === "sermons") {
      allowedTypes = [...allowedAudioTypes, ...allowedVideoTypes];
      maxSize = 50 * 1024 * 1024; // 50MB
      typeMessage = "Only audio and video files are allowed.";
    } else if (folder === "books") {
      allowedTypes = [...allowedDocTypes, ...allowedImageTypes];
      maxSize = 20 * 1024 * 1024; // 20MB
      typeMessage = "Only PDF files and cover images are allowed.";
    } else if (folder === "events" || folder === "short-messages") {
      allowedTypes = [...allowedImageTypes, ...allowedAudioTypes, ...allowedVideoTypes];
      maxSize = 50 * 1024 * 1024; // 50MB
      typeMessage = "Only images, audio/voice, and video files are allowed.";
    } else {
      allowedTypes = allowedImageTypes;
      maxSize = 5 * 1024 * 1024; // 5MB
      typeMessage = "Only image files are allowed (JPG, PNG, WEBP, GIF).";
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: typeMessage }, { status: 400 });
    }

    if (file.size > maxSize) {
      const sizeInMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File size must be under ${sizeInMb}MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${filename}`;
    return NextResponse.json({ url }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
