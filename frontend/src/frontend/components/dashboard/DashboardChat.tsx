"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Send } from "lucide-react";

interface DashboardChatProps {
  user: any;
  isActive: boolean;
}

export function DashboardChat({ user, isActive }: DashboardChatProps) {
  const { t } = useLanguage();
  const [chatType, setChatType] = useState<"global" | "church">("global");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchChatMessages = () => {
    const url = chatType === "global" 
      ? "/api/chat?chatType=global" 
      : `/api/chat?chatType=church&chatGroupId=${user?.churchId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setChatMessages(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (!isActive) return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [chatType, isActive]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;

    const payload = {
      chatType,
      chatGroupId: chatType === "church" ? user?.churchId : undefined,
      content: chatInput,
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setChatInput("");
      fetchChatMessages();
    }
  };

  if (!isActive) return null;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col h-[550px]">
      
      {/* Chat Header selector */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 shrink-0">
        <button
          onClick={() => setChatType("global")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            chatType === "global"
              ? "bg-gold-500 text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          🕊️ {t("chatGlobal")}
        </button>
        <button
          onClick={() => setChatType("church")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            chatType === "church"
              ? "bg-gold-500 text-slate-950"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          ⛪ {t("chatChurch")}
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-grow overflow-y-auto my-4 space-y-3 pr-2">
        {chatMessages.length > 0 ? (
          chatMessages.map((msg: any, idx: number) => {
            const isOwn = msg.sender?._id === user?.id;
            return (
              <div key={idx} className={`flex gap-2.5 max-w-[80%] ${isOwn ? "ml-auto flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                  {msg.sender?.name?.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-0.5 px-1">
                    {isOwn ? "You" : msg.sender?.name}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isOwn 
                      ? "bg-gold-500 text-slate-950 rounded-tr-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-20">
            {t("chatNoMessages")}
          </p>
        )}
        <div ref={chatScrollRef} />
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={t("chatTypeMessage")}
          className="flex-grow px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-gold-500"
        />
        <button type="submit" className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow">
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}
