import { NextResponse } from "next/server";
import { getCurrentUser, handleApiError } from "@/backend/auth/session";

// Mock/Default Live Broadcast State
let liveState = {
  isLive: true,
  titleEn: "YSF Sunday Youth Revival Service & Praise Worship",
  titleAm: "የያቦቅ እሑድ የወጣቶች ሕያው አገልግሎት እና አምልኮ",
  videoUrl: "https://www.youtube.com/embed/live_stream?channel=UC_yabbok_fellowship",
  audioRadioUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  viewersCount: 142,
  chatMessages: [
    { id: "1", user: "Abebe K.", text: "Amen! Hallelujah! አሜን!", time: "10:15 AM" },
    { id: "2", user: "Tigist M.", text: "Praying from Hawassa branch! ከሀዋሳ ህብረት እንጸልያለን!", time: "10:17 AM" },
    { id: "3", user: "Yonas B.", text: "Glory to God! ለእግዚአብሔር ምስጋና ይሁን!", time: "10:20 AM" },
  ],
};

export async function GET() {
  return NextResponse.json(liveState);
}

export async function POST(req: Request) {
  try {
    const userObj = await getCurrentUser();
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const newMessage = {
      id: Date.now().toString(),
      user: userObj?.name || "Guest Youth",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    liveState.chatMessages.push(newMessage);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    return handleApiError(err, "Failed to post live chat");
  }
}
