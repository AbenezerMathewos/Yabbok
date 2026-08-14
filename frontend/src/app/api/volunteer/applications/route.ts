import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import VolunteerApplication from "@/backend/models/VolunteerApplication";
import MinistryOpportunity from "@/backend/models/MinistryOpportunity";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    if (view === "admin") {
      if (!['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Get applications for ALL opportunities. (In a massive system, this would be filtered by churchBranch)
      const applications = await VolunteerApplication.find()
        .populate({ path: "applicant", model: User, select: "name email phone profilePhoto" })
        .populate({ path: "opportunity", model: MinistryOpportunity, select: "title date churchBranch createdBy" })
        .sort({ createdAt: -1 })
        .exec();

      return NextResponse.json(applications, { status: 200 });
    } else {
      // My applications
      const applications = await VolunteerApplication.find({ applicant: session.user.id })
        .populate({ path: "opportunity", model: MinistryOpportunity, select: "title description date churchBranch createdBy status" })
        .sort({ createdAt: -1 })
        .exec();

      return NextResponse.json(applications, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { opportunityId, notes } = body;

    if (!opportunityId) {
      return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
    }

    // Check if already applied
    const existing = await VolunteerApplication.findOne({
      opportunity: opportunityId,
      applicant: session.user.id,
    });

    if (existing) {
      return NextResponse.json({ error: "You have already applied to this opportunity." }, { status: 400 });
    }

    const app = await VolunteerApplication.create({
      opportunity: opportunityId,
      applicant: session.user.id,
      notes,
      status: "pending",
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const app = await VolunteerApplication.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(app, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
