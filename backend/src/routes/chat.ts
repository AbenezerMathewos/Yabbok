import express from 'express';
import { requireAuth } from '../middleware/auth';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { getToken } = require('next-auth/jwt');
    const secret = process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345";
    const userObj = await getToken({ req, secret });

    if (!userObj) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chatType = (req.query.chatType as string) || "global"; // global, church, private
    const chatGroupId = req.query.chatGroupId as string; // e.g. churchId or ministry room
    const contactId = req.query.contactId as string; // for private chat

    let query: any = { chatType };

    if (chatType === "global") {
      // Global chat query - no extra parameters
    } else if (chatType === "church") {
      if (!chatGroupId) {
        return res.status(400).json({ error: "Church Group ID is required" });
      }
      query.chatGroupId = chatGroupId;
    } else if (chatType === "private") {
      if (!contactId) {
        return res.status(400).json({ error: "Contact ID is required" });
      }
      query = {
        chatType: "private",
        $or: [
          { sender: userObj.id, recipient: contactId },
          { sender: contactId, recipient: userObj.id },
        ],
      };
    } else {
      return res.status(400).json({ error: "Invalid chat type" });
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

    res.json(messages);
  } catch (error: any) {
    console.error("Chat fetch error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const userObj = req.user;
    if (userObj.status !== "active") {
      return res.status(403).json({ error: "Account not active." });
    }

    const { chatType, chatGroupId, contactId, content, mediaUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

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

    res.status(201).json(populated);
  } catch (error: any) {
    console.error("Message send error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
