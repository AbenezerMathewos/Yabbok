import { NextResponse } from "next/server";
import { getCurrentUser, requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Devotional from "@/backend/models/Devotional";

export async function GET() {
  try {
    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);
    let devo = await Devotional.findOne({ date: today });

    if (!devo) {
      devo = await Devotional.create({
        date: today,
        verseRef: "Psalm 119:105",
        verseEn: "Your word is a lamp to my feet and a light to my path.",
        verseAm: "ሕግህ ለእግሬ መብራት፥ ለጎዳናዬም ብርሃን ነው።",
        reflectionEn: "God's word guides our steps daily. Even in uncertainty, His light illumines the next right step.",
        reflectionAm: "የእግዚአብሔር ቃል በየቀኑ እርምጃችንን ይመራል። በማይታወቅ ሁኔታ ውስጥ እንኳን፣ ብርሃኑ የሚቀጥለውን ትክክለኛ እርምጃ ያበራል።",
        author: "YSF Youth Leadership",
        completedUsers: [],
      });
    }

    return NextResponse.json(devo);
  } catch (err) {
    return handleApiError(err, "Failed to fetch devotional");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    await connectToDatabase();
    const today = new Date().toISOString().slice(0, 10);

    let devo = await Devotional.findOne({ date: today });
    if (devo && !devo.completedUsers.includes(userObj.id)) {
      devo.completedUsers.push(userObj.id);
      await devo.save();
    }

    return NextResponse.json(devo);
  } catch (err) {
    return handleApiError(err, "Failed to record quiet time");
  }
}
