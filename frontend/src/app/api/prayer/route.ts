import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/backend/auth/session";
import { connectToDatabase } from "@/backend/lib/mongodb";
import Prayer from "@/backend/models/Prayer";

export async function GET() {
  try {
    await connectToDatabase();
    const prayers = await Prayer.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name profilePhoto churchBranch");
    return NextResponse.json(prayers);
  } catch (err) {
    return handleApiError(err, "Failed to fetch prayer requests");
  }
}

export async function POST(req: Request) {
  try {
    const userObj = await requireUser();
    const { title, description, category, isAnonymous } = await req.json();
    await connectToDatabase();

    const newPrayer = await Prayer.create({
      user: userObj.id,
      title,
      description,
      category,
      isAnonymous,
    });

    const populated = await Prayer.findById(newPrayer._id).populate("user", "name profilePhoto churchBranch");
    return NextResponse.json(populated, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to submit prayer request");
  }
}

export async function PATCH(req: Request) {
  try {
    const userObj = await requireUser();
    const { prayerId, action, testimony } = await req.json();
    await connectToDatabase();

    const prayer = await Prayer.findById(prayerId);
    if (!prayer) {
      return NextResponse.json({ error: "Prayer request not found" }, { status: 404 });
    }

    if (action === "pray") {
      if (!prayer.prayedUsers.includes(userObj.id)) {
        prayer.prayedUsers.push(userObj.id);
        prayer.prayedCount += 1;
        await prayer.save();
      }
    } else if (action === "testimony") {
      if (prayer.user.toString() !== userObj.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      prayer.status = "answered";
      prayer.testimony = testimony;
      await prayer.save();
    }

    const updated = await Prayer.findById(prayerId).populate("user", "name profilePhoto churchBranch");
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err, "Failed to update prayer request");
  }
}
