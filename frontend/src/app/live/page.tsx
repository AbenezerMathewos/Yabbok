"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { Radio, Video, Send, Users, Heart, Sparkles, MessageCircle, Signal } from "lucide-react";
import { toast } from "sonner";

export default function LiveStreamPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();

  const [streamData, setStreamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streamMode, setStreamMode] = useState<"video" | "audio">("video");
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const fetchLiveState = async () => {
    try {
      const res = await fetch("/api/live");
      if (res.ok) {
        setStreamData(await res.json());
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setSendingChat(true);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatInput }),
      });
      if (res.ok) {
        setChatInput("");
        fetchLiveState();
      }
    } catch (e) {
      toast.error(language === "en" ? "Failed to send comment" : "አስተያየት መላክ አልተሳካም");
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {language === "en" ? "LIVE BROADCAST NOW" : "አሁን በቀጥታ ስርጭት"}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {streamData
                  ? language === "en"
                    ? streamData.titleEn
                    : streamData.titleAm
                  : "YABBOK Live Worship Service"}
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start md:self-auto">
              <button
                onClick={() => setStreamMode("video")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  streamMode === "video"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Video size={16} />
                {language === "en" ? "HD Video Stream" : "ቪዲዮ ስርጭት"}
              </button>
              <button
                onClick={() => setStreamMode("audio")}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  streamMode === "audio"
                    ? "bg-gold-500 text-slate-950 shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Radio size={16} />
                {language === "en" ? "Low-Data Audio Radio" : "የድምጽ ሬዲዮ (አነስተኛ ዳታ)"}
              </button>
            </div>
          </div>

          {/* Main Grid: Stream & Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col (2/3): Stream Player */}
            <div className="lg:col-span-2 space-y-6">
              
              {loading ? (
                <Skeleton className="w-full aspect-video rounded-3xl bg-slate-900" />
              ) : streamMode === "video" ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="YABBOK Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Low-Data Audio Radio Stream Player */
                <div className="p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-gold-950/40 border border-gold-500/30 text-center space-y-6 shadow-2xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 flex items-center justify-center animate-pulse shadow-gold-500/20 shadow-lg">
                    <Radio size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {language === "en"
                        ? "Low-Data Audio Radio Mode Active"
                        : "አነስተኛ የዳታ ድምጽ ሬዲዮ ስርጭት"}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {language === "en"
                        ? "Optimized for mobile connections. Consumes up to 90% less data while delivering high quality audio worship."
                        : "ለሞባይል ዳታ የተመቸ። ጥራት ያለው የድምጽ አምልኮ እያቀረበ እስከ 90% ዳታ ይቆጥባል።"}
                    </p>
                  </div>
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <audio
                      src={streamData?.audioRadioUrl}
                      controls
                      autoPlay
                      className="w-full h-10 accent-gold-500"
                    />
                  </div>
                </div>
              )}

              {/* Stream Meta Stats */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Users size={16} className="text-gold-400" />
                    {streamData?.viewersCount || 142} {language === "en" ? "Youth Tuned In" : "ተሳታፊዎች"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Signal size={16} />
                    {language === "en" ? "High Quality Signal" : "ጥራት ያለው ስርጭት"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success(language === "en" ? "Amen! Reaction sent." : "አሜን! ተልኳል::")}
                    className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/30 transition-colors"
                  >
                    <Heart size={14} className="fill-current" />
                    {language === "en" ? "Amen" : "አሜን"}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Col (1/3): Live Chat */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[560px] overflow-hidden">
              
              <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle size={16} className="text-gold-400" />
                  {language === "en" ? "Live Community Chat" : "ቀጥታ የህብረት ውይይት"}
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {streamData?.chatMessages?.length || 0} {language === "en" ? "Messages" : "መልእክቶች"}
                </span>
              </div>

              {/* Messages list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                {streamData?.chatMessages?.map((msg: any) => (
                  <div key={msg.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gold-400">{msg.user}</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder={
                    language === "en"
                      ? "Share prayer or amen..."
                      : "ጸሎት ወይም አሜን ይበሉ..."
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  disabled={sendingChat}
                  className="px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </form>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
