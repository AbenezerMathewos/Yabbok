import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import BenevolenceRequest from "@/backend/models/BenevolenceRequest";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "admin" or "my_requests"

    if (view === "admin") {
      if (!['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      const requests = await BenevolenceRequest.find()
        .populate({ path: "applicant", model: User, select: "name email profilePhoto phone churchBranch" })
        .sort({ createdAt: -1 })
        .exec();

      return NextResponse.json(requests, { status: 200 });
    } else {
      // My requests
      const requests = await BenevolenceRequest.find({ applicant: session.user.id })
        .sort({ createdAt: -1 })
        .exec();
      return NextResponse.json(requests, { status: 200 });
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
    const { amountRequested, category, description } = body;

    if (!amountRequested || !category || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const request = await BenevolenceRequest.create({
      applicant: session.user.id,
      amountRequested: Number(amountRequested),
      category,
      description,
      status: "pending",
    });

    return NextResponse.json(request, { status: 201 });
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
    const { requestId, status, amountApproved, reviewerNotes } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (amountApproved !== undefined) updateData.amountApproved = Number(amountApproved);
    if (reviewerNotes !== undefined) updateData.reviewerNotes = reviewerNotes;

    const request = await BenevolenceRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
