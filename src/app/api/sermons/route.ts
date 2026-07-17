import { NextResponse } from "next/server";
import { getCurrentUser, requireAnyPermission, handleApiError } from "@/backend/auth/session";
import { hasPermission } from "@/backend/auth/roles";
import { connectToDatabase } from "@/backend/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/backend/lib/auth";
import Sermon from "@/backend/models/Sermon";

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

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("includeAll") === "true";

    let query: any = { deletedAt: { $exists: false } };

    if (includeAll) {
      const session = await getServerSession(authOptions);
      const user = session?.user as any;
      const isAdminOrSuperAdmin = user && ["super_admin", "admin", "moderator", "church_leader"].includes(user.role);
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

    return NextResponse.json(sermons);
  } catch (error: any) {
    console.error("Sermons fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAnyPermission(["media:manage"]);
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Only admins and super admins can upload sermons." }, { status: 403 });
    }

    const body = await req.json();
    const { title, speaker, date, description, audioUrl, videoUrl, notes, category } = body;

    if (!title || !speaker || !date || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

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
      churchId: body.churchId || undefined,
      approvalStatus: user.role === "super_admin" ? "approved" : "pending",
    });

    return NextResponse.json(newSermon, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "Sermon creation failed");
  }
}
