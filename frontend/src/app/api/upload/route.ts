import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError } from "@/backend/auth/session";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const userObj = await getCurrentUser();
    if (!userObj) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique name
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${safeName}`;

    // Target upload directory inside public folder
    const targetDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err) {
    return handleApiError(err, "Failed to upload file");
  }
}
