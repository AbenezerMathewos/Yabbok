import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import CounselingRequest from "@/backend/models/CounselingRequest";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view"); // "triage" or "my_requests"

    if (view === "triage") {
      // Only admins/leaders can view triage queue
      if (!['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      const requests = await CounselingRequest.find()
        .populate({ path: "user", model: User, select: "name profilePhoto gender age churchBranch phone" })
        .populate({ path: "counselor", model: User, select: "name profilePhoto" })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
        
      // Handle anonymity in the triage queue
      const processed = requests.map(req => {
        if (req.isAnonymous) {
           return { ...req, user: { _id: req.user?._id, name: "Anonymous Member", profilePhoto: null, churchBranch: (req.user as any)?.churchBranch }};
        }
        return req;
      });

      return NextResponse.json(processed, { status: 200 });
    } else {
      // My requests
      const requests = await CounselingRequest.find({ user: session.user.id })
        .populate({ path: "counselor", model: User, select: "name profilePhoto" })
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
    const { topic, urgency, description, isAnonymous } = body;

    if (!topic || !urgency || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const request = await CounselingRequest.create({
      user: session.user.id,
      topic,
      urgency,
      description,
      isAnonymous: !!isAnonymous,
      status: "open",
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
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, status, message } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    const request = await CounselingRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const isOwner = request.user.toString() === session.user.id;
    const isLeader = ['admin', 'super_admin', 'moderator', 'church_leader'].includes(session.user.role);

    if (!isOwner && !isLeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update status and assign counselor
    if (status && isLeader) {
      request.status = status;
      if (status === "in_progress" && !request.counselor) {
        request.counselor = session.user.id as any;
      }
    }

    // Add message to thread
    if (message) {
      request.messages.push({
        senderId: session.user.id as any,
        content: message,
        createdAt: new Date(),
      });
    }

    await request.save();

    return NextResponse.json(request, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
