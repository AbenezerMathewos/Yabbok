import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
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
    const view = searchParams.get("view"); // "all" or "pending"

    let query: any = { status: "approved" };

    if (view === "pending") {
      if (!['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      query = { status: "pending" };
    }

    const opportunities = await MinistryOpportunity.find(query)
      .populate({ path: "createdBy", model: User, select: "name profilePhoto" })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(opportunities, { status: 200 });
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
    const { title, description, skillsRequired, date, churchBranch } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Leaders bypass the "pending" state automatically. Normal users go to "pending".
    const isLeader = ['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role);
    const status = isLeader ? "approved" : "pending";

    const opp = await MinistryOpportunity.create({
      title,
      description,
      skillsRequired: skillsRequired || [],
      date,
      churchBranch,
      createdBy: session.user.id,
      status,
    });

    return NextResponse.json(opp, { status: 201 });
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
    const { opportunityId, status } = body;

    if (!opportunityId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const opp = await MinistryOpportunity.findByIdAndUpdate(
      opportunityId,
      { status },
      { new: true }
    );

    if (!opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json(opp, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
