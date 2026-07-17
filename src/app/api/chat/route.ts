import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/lib/auth";
import { connectToDatabase } from "@/backend/lib/mongodb";
import ChatMessage from "@/backend/models/ChatMessage";
import User from "@/backend/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObj = session.user as any;
    const { searchParams } = new URL(req.url);
    const chatType = searchParams.get("chatType") || "global"; // global, church, private
    const chatGroupId = searchParams.get("chatGroupId"); // e.g. churchId or ministry room
    const contactId = searchParams.get("contactId"); // for private chat

    await connectToDatabase();

    let query: any = { chatType };

    if (chatType === "global") {
      // Global chat query - no extra parameters
    } else if (chatType === "church") {
      if (!chatGroupId) {
        return NextResponse.json({ error: "Church Group ID is required" }, { status: 400 });
      }
      query.chatGroupId = chatGroupId;
    } else if (chatType === "private") {
      if (!contactId) {
        return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
      }
      query = {
        chatType: "private",
        $or: [
          { sender: userObj.id, recipient: contactId },
          { sender: contactId, recipient: userObj.id },
        ],
      };
    } else {
      return NextResponse.json({ error: "Invalid chat type" }, { status: 400 });
    }

    let messages = await ChatMessage.find(query)
      .populate("sender", "name profilePhoto role")
      .populate("recipient", "name profilePhoto role")
      .sort({ createdAt: 1 })
      .limit(100);

    // Auto-seed global messages if empty
    if (chatType === "global" && messages.length === 0) {
      // Find a mock sender (e.g. administrator or first active user)
      let admin = await User.findOne({ role: "super_admin" });
      if (!admin) admin = await User.findOne({});
      
      if (admin) {
        const defaultMessages = [
          {
            sender: admin._id,
            chatType: "global",
            content: "Welcome to the YABBOK Global Fellowship Chat! Feel free to greet each other in Christian love. 🕊️",
            readBy: [admin._id],
          },
          {
            sender: admin._id,
            chatType: "global",
            content: "እንኳን ወደ ያቦቅ አጠቃላይ የወጣቶች ህብረት የውይይት ክፍል በደህና መጣችሁ! እርስ በእርሳችን እንገናኝ።",
            readBy: [admin._id],
          }
        ];
        await ChatMessage.insertMany(defaultMessages);
        messages = await ChatMessage.find(query)
          .populate("sender", "name profilePhoto role")
          .populate("recipient", "name profilePhoto role")
          .sort({ createdAt: 1 });
      }
    }

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Chat fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObj = session.user as any;
    if (userObj.status !== "active") {
      return NextResponse.json({ error: "Account not active." }, { status: 403 });
    }

    const body = await req.json();
    const { chatType, chatGroupId, contactId, content, mediaUrl } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newMessage = await ChatMessage.create({
      sender: userObj.id,
      recipient: chatType === "private" ? contactId : undefined,
      chatType,
      chatGroupId: chatType !== "private" ? chatGroupId : undefined,
      content,
      mediaUrl: mediaUrl || "",
      reactions: [],
      readBy: [userObj.id],
    });

    const populated = await newMessage.populate("sender", "name profilePhoto role");

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
