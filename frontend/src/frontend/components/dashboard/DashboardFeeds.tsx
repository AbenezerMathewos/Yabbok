"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";

interface DashboardFeedsProps {
  user: any;
}

export function DashboardFeeds({ user }: DashboardFeedsProps) {
  const { t, language } = useLanguage();

  const [prayers, setPrayers] = useState<any[]>([]);
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  
  const [newPrayer, setNewPrayer] = useState({ content: "", isAnonymous: false });
  const [newTestimony, setNewTestimony] = useState({ title: "", content: "", mediaUrl: "" });
  const [newInsight, setNewInsight] = useState({ content: "", bibleReferences: "" });
  const [commentInput, setCommentInput] = useState<{[key: string]: string}>({});

  const fetchPrayers = () => {
    fetch("/api/prayers")
      .then((res) => res.json())
      .then((data) => setPrayers(data))
      .catch(console.error);
  };

  const fetchTestimonies = () => {
    fetch("/api/testimonies")
      .then((res) => res.json())
      .then((data) => setTestimonies(data))
      .catch(console.error);
  };

  const fetchInsights = () => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchPrayers();
    fetchTestimonies();
    fetchInsights();
  }, []);

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.content) return;
    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPrayer),
    });
    if (res.ok) {
      setNewPrayer({ content: "", isAnonymous: false });
      fetchPrayers();
    }
  };

  const handleCreateTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimony.title || !newTestimony.content) return;
    const res = await fetch("/api/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTestimony.title,
        content: newTestimony.content,
        media: newTestimony.mediaUrl ? [newTestimony.mediaUrl] : [],
      }),
    });
    if (res.ok) {
      setNewTestimony({ title: "", content: "", mediaUrl: "" });
      fetchTestimonies();
    }
  };

  const handleCreateInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.content) return;
    const refs = newInsight.bibleReferences
      ? newInsight.bibleReferences.split(",").map((s) => s.trim())
      : [];
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newInsight.content, bibleReferences: refs }),
    });
    if (res.ok) {
      setNewInsight({ content: "", bibleReferences: "" });
      fetchInsights();
    }
  };

  const handlePrayerAction = async (prayerId: string, action: "pray" | "react", type?: string) => {
    await fetch(`/api/prayers?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerId, type }),
    });
    fetchPrayers();
  };

  const handleAddPrayerComment = async (prayerId: string) => {
    const text = commentInput[prayerId];
    if (!text) return;
    await fetch(`/api/prayers?action=comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerId, content: text }),
    });
    setCommentInput({ ...commentInput, [prayerId]: "" });
    fetchPrayers();
  };

  const handleTestimonyAction = async (testimonyId: string, action: "react", type: string) => {
    await fetch(`/api/testimonies?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testimonyId, type }),
    });
    fetchTestimonies();
  };

  const handleInsightAction = async (insightId: string, action: "react", type: string) => {
    await fetch(`/api/insights?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId, type }),
    });
    fetchInsights();
  };

  return (
    <div className="space-y-8">
      {/* Share Inputs forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleCreatePrayer} className="space-y-3">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
              🙏 Request Prayer
            </span>
            <textarea
              rows={3}
              value={newPrayer.content}
              onChange={(e) => setNewPrayer({ ...newPrayer, content: e.target.value })}
              placeholder={t("prayerPlaceholder")}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={newPrayer.isAnonymous}
                onChange={(e) => setNewPrayer({ ...newPrayer, isAnonymous: e.target.checked })}
                className="rounded text-gold-500 focus:ring-gold-500"
              />
              <span>{t("anonymousLabel")}</span>
            </label>
            <button type="submit" className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs">
              {t("btnPost")}
            </button>
          </form>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleCreateTestimony} className="space-y-3">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
              🎉 Share Testimony
            </span>
            <input
              type="text"
              value={newTestimony.title}
              onChange={(e) => setNewTestimony({ ...newTestimony, title: e.target.value })}
              placeholder="Testimony Title"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            />
            <textarea
              rows={2}
              value={newTestimony.content}
              onChange={(e) => setNewTestimony({ ...newTestimony, content: e.target.value })}
              placeholder={t("testimonyPlaceholder")}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
            />
            <button type="submit" className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs">
              {t("btnPost")}
            </button>
          </form>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleCreateInsight} className="space-y-3">
            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
              ✍️ What God Taught Me
            </span>
            <textarea
              rows={3}
              value={newInsight.content}
              onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
              placeholder={t("insightPlaceholder")}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
            />
            <input
              type="text"
              value={newInsight.bibleReferences}
              onChange={(e) => setNewInsight({ ...newInsight, bibleReferences: e.target.value })}
              placeholder={t("insightRefPlaceholder")}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            />
            <button type="submit" className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs">
              {t("btnPost")}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white border-b pb-2">
          🌿 Community Fellowship Stream
        </h3>

        {insights.map((insight: any) => (
          <div key={insight._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-xs">
                {insight.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-xs">{insight.user?.name}</h4>
                <span className="text-[9px] text-slate-400">What God Taught Me Today</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {insight.content}
            </p>
            {insight.bibleReferences?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {insight.bibleReferences.map((ref: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold border border-gold-500/25">
                    📖 {ref}
                  </span>
                ))}
              </div>
            )}
            <div className="pt-2 flex gap-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => handleInsightAction(insight._id, "react", "praise_god")} className="hover:text-gold-500 flex items-center gap-1 font-semibold">
                🙌 Praise God ({insight.reactions?.length || 0})
              </button>
            </div>
          </div>
        ))}

        {prayers.map((prayer: any) => (
          <div key={prayer._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                {prayer.isAnonymous ? "🕊️" : prayer.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-xs">
                  {prayer.isAnonymous ? (language === 'en' ? 'Anonymous Member' : 'ስሙ ያልተጠቀሰ አባል') : prayer.user?.name}
                </h4>
                <span className="text-[9px] text-slate-400">Prayer Wall Request</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {prayer.content}
            </p>
            
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handlePrayerAction(prayer._id, "pray")}
                className={`flex items-center gap-1 font-semibold hover:text-gold-500 ${
                  prayer.prayedForBy?.includes(user?.id) ? "text-gold-500 font-bold" : ""
                }`}
              >
                🙏 {t("btnIPrayed")} ({prayer.prayedForBy?.length || 0})
              </button>

              <button onClick={() => handlePrayerAction(prayer._id, "react", "amen")} className="flex items-center gap-1 font-semibold hover:text-gold-500">
                ✨ Amen ({prayer.reactions?.filter((r: any) => r.type === "amen").length || 0})
              </button>
            </div>

            <div className="pt-3 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
              <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                {t("commentsLabel")}
              </h5>
              {prayer.comments?.map((c: any, idx: number) => (
                <div key={idx} className="text-xs leading-relaxed border-b border-slate-100 dark:border-slate-900 pb-1.5 last:border-b-0">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">{c.user?.name}:</span>
                  <span className="text-slate-500 dark:text-slate-400">{c.content}</span>
                </div>
              ))}
              
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200/50">
                <input
                  type="text"
                  value={commentInput[prayer._id] || ""}
                  onChange={(e) => setCommentInput({ ...commentInput, [prayer._id]: e.target.value })}
                  placeholder={t("addCommentPlaceholder")}
                  className="flex-grow px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs focus:outline-none"
                />
                <button onClick={() => handleAddPrayerComment(prayer._id)} className="px-3.5 py-1.5 bg-gold-500 text-slate-950 font-bold rounded-lg text-xs">
                  {t("btnComment")}
                </button>
              </div>
            </div>
          </div>
        ))}

        {testimonies.map((test: any) => (
          <div key={test._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                {test.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-xs">{test.user?.name}</h4>
                <span className="text-[9px] text-slate-400">Praise Testimony</span>
              </div>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{test.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{test.content}</p>
            <div className="pt-2 flex gap-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => handleTestimonyAction(test._id, "react", "praise_god")} className="hover:text-gold-500 flex items-center gap-1 font-semibold">
                🙌 Praise God ({test.reactions?.length || 0})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
