import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import MentorshipConnection from "@/backend/models/MentorshipConnection";
import MentorProfile from "@/backend/models/MentorProfile";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch connections where the user is either the mentor or the mentee
    const connections = await MentorshipConnection.find({
      $or: [{ mentorId: userId }, { menteeId: userId }]
    })
      .populate({
        path: "mentorId",
        model: User,
        select: "name profilePhoto role churchBranch",
      })
      .populate({
        path: "menteeId",
        model: User,
        select: "name profilePhoto role churchBranch",
      })
      .sort({ updatedAt: -1 })
      .exec();

    return NextResponse.json(connections, { status: 200 });
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
    const { mentorId, goals } = body;

    if (!mentorId) {
      return NextResponse.json({ error: "mentorId is required" }, { status: 400 });
    }

    const menteeId = session.user.id;

    // Check if a connection already exists
    const existing = await MentorshipConnection.findOne({
      mentorId,
      menteeId,
      status: { $in: ["pending", "active"] },
    });

    if (existing) {
      return NextResponse.json({ error: "A pending or active connection already exists with this mentor." }, { status: 400 });
    }

    const connection = await MentorshipConnection.create({
      mentorId,
      menteeId,
      goals: goals || [],
      status: "pending",
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { connectionId, status, note } = body;

    if (!connectionId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const connection = await MentorshipConnection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Verify ownership (only mentor can accept/decline; both can complete)
    const isMentor = connection.mentorId.toString() === session.user.id;
    const isMentee = connection.menteeId.toString() === session.user.id;

    if (!isMentor && !isMentee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if ((status === "active" || status === "declined") && !isMentor) {
      return NextResponse.json({ error: "Only the mentor can accept or decline a request." }, { status: 403 });
    }

    connection.status = status;

    // If active, increment the mentor's currentMentees count
    if (status === "active") {
      await MentorProfile.findOneAndUpdate(
        { user: connection.mentorId },
        { $inc: { currentMentees: 1 } }
      );
    }
    
    // If completed or declined from an active state, decrement
    if ((status === "completed" || status === "declined") && connection.status === "active") {
        await MentorProfile.findOneAndUpdate(
            { user: connection.mentorId },
            { $inc: { currentMentees: -1 } }
        );
    }

    // Add a meeting note if provided (e.g. for logging a session)
    if (note && status === "active") {
      connection.meetingNotes.push({
        date: new Date(),
        notes: note,
        actionItems: [],
      });
    }

    await connection.save();

    return NextResponse.json(connection, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
