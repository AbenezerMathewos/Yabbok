"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { Heart, Plus, Sparkles, MessageSquareHeart, ShieldCheck, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PrayerPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as any;

  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"wall" | "answered" | "submit">("wall");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "healing",
    isAnonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Testimony State
  const [testimonyInput, setTestimonyInput] = useState<{ [key: string]: string }>({});

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayer");
      if (res.ok) setPrayers(await res.json());
    } catch (err) {
      toast.error(language === "en" ? "Failed to load prayer requests" : "የጸሎት ጥያቄዎችን መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handlePray = async (prayerId: string) => {
    try {
      const res = await fetch("/api/prayer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerId, action: "pray" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPrayers(prayers.map((p) => (p._id === prayerId ? updated : p)));
        toast.success(language === "en" ? "Thank you for interceding!" : "ስለጸለዩ እናመሰግናለን!");
      }
    } catch (err) {
      toast.error(language === "en" ? "An error occurred" : "ስህተት ተከስቷል");
    }
  };

  const handleTestimonySubmit = async (prayerId: string) => {
    const text = testimonyInput[prayerId];
    if (!text) return;

    try {
      const res = await fetch("/api/prayer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerId, action: "testimony", testimony: text }),
      });
      if (res.ok) {
        toast.success(language === "en" ? "Praise God! Testimony published!" : "እግዚአብሔር ይመስገን! ምስክርነቱ ተለጥፏል!");
        fetchPrayers();
        setActiveTab("answered");
      }
    } catch (err) {
      toast.error(language === "en" ? "Failed to post testimony" : "ምስክርነት መለጠፍ አልተቻለም");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(language === "en" ? "Prayer request submitted!" : "የጸሎት ጥያቄው ቀርቧል!");
        setFormData({ title: "", description: "", category: "healing", isAnonymous: false });
        fetchPrayers();
        setActiveTab("wall");
      } else {
        toast.error(language === "en" ? "Failed to submit prayer request" : "የጸሎት ጥያቄ ማቅረብ አልተሳካም");
      }
    } catch (err) {
      toast.error(language === "en" ? "An error occurred" : "ስህተት ተከስቷል");
    } finally {
      setSubmitting(false);
    }
  };

  const activePrayers = prayers.filter((p) => p.status === "active");
  const answeredPrayers = prayers.filter((p) => p.status === "answered");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-3">
              <MessageSquareHeart className="text-rose-500" size={32} />
              {language === "en" ? "Prayer Request & Testimony Wall" : "የጸሎት ጥያቄ እና የምስክርነት ግድግዳ"}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {language === "en"
                ? "Bear one another's burdens in prayer. Intercede for fellowship members and rejoice in answered prayers."
                : "በጸሎት የእርስ በእርስ ሸክምን ተሸከሙ። ለህብረት አባላት ማልዱ እና በተመለሱ ጸሎቶች ደስ ይበላችሁ።"}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("wall")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "wall"
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Heart size={16} />
              {language === "en" ? "Prayer Wall" : "የጸሎት ግድግዳ"} ({activePrayers.length})
            </button>
            <button
              onClick={() => setActiveTab("answered")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "answered"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles size={16} />
              {language === "en" ? "Answered Testimonies" : "የተመለሱ ምስክርነቶች"} ({answeredPrayers.length})
            </button>
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "submit"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Plus size={16} />
              {language === "en" ? "Submit Request" : "ጥያቄ አቅርብ"}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4, 5].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
                  <Skeleton className="h-6 w-1/3 rounded-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* TAB 1: PRAYER WALL */}
              {activeTab === "wall" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activePrayers.map((prayer) => {
                    const isMyRequest = prayer.user?._id === user?.id;
                    const hasPrayed = prayer.prayedUsers?.includes(user?.id);

                    return (
                      <div
                        key={prayer._id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                              {prayer.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {new Date(prayer.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                            {prayer.title}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {prayer.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4 text-slate-500 text-[11px]">
                            {prayer.isAnonymous ? (
                              <span className="flex items-center gap-1 font-bold text-slate-400">
                                <EyeOff size={13} /> {language === "en" ? "Anonymous Member" : "ስሙ ያልተጠቀሰ አባል"}
                              </span>
                            ) : (
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                🙏 {prayer.user?.name} ({prayer.user?.churchBranch || "YSF"})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handlePray(prayer._id)}
                              disabled={hasPrayed}
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                                hasPrayed
                                  ? "bg-rose-500/10 text-rose-500 cursor-default"
                                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                              }`}
                            >
                              <Heart size={14} className={hasPrayed ? "fill-current" : ""} />
                              {hasPrayed
                                ? language === "en"
                                  ? "You Prayed"
                                  : "ጸልየዋል"
                                : language === "en"
                                ? "I Prayed for This"
                                : "ለዚህ ጸልያለሁ"}
                            </button>

                            <span className="text-xs font-extrabold text-rose-500">
                              ❤️ {prayer.prayedCount} {language === "en" ? "Prayers" : "ጸሎቶች"}
                            </span>
                          </div>

                          {/* Post testimony section if owned by current user */}
                          {isMyRequest && (
                            <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                              <p className="text-[10px] font-bold text-emerald-500 mb-1">
                                {language === "en" ? "God answered this prayer?" : "እግዚአብሔር ይህን ጸሎት መለሰ?"}
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={
                                    language === "en"
                                      ? "Share your testimony..."
                                      : "ምስክርነትዎን ያካፍሉ..."
                                  }
                                  value={testimonyInput[prayer._id] || ""}
                                  onChange={(e) =>
                                    setTestimonyInput({ ...testimonyInput, [prayer._id]: e.target.value })
                                  }
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  onClick={() => handleTestimonySubmit(prayer._id)}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs"
                                >
                                  {language === "en" ? "Share" : "አካፍል"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activePrayers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <MessageSquareHeart size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {language === "en" ? "No Active Prayer Requests" : "ምንም ክፍት የጸሎት ጥያቄዎች የሉም"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === "en" ? "Be the first to share a prayer request with the fellowship." : "የጸሎት ጥያቄ በማጋራት የመጀመሪያ ይሁኑ።"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ANSWERED TESTIMONIES */}
              {activeTab === "answered" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {answeredPrayers.map((prayer) => (
                    <div
                      key={prayer._id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={12} /> {language === "en" ? "Answered Prayer" : "የተመለሰ ጸሎት"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(prayer.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                          {prayer.title}
                        </h4>
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                          "{prayer.description}"
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                          <Sparkles size={12} /> {language === "en" ? "Praise & Testimony" : "ምስጋና እና ምስክርነት"}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {prayer.testimony || (language === "en" ? "God faithfully answered this prayer!" : "እግዚአብሔር ይህን ጸሎት በታማኝነት መለሰ!")}
                        </p>
                      </div>
                    </div>
                  ))}

                  {answeredPrayers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <Sparkles size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {language === "en" ? "No Testimonies Yet" : "ምንም ምስክርነቶች የሉም"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === "en" ? "Testimonies will appear here when prayers are answered." : "ጸሎቶች ሲመለሱ ምስክርነቶች እዚህ ይታያሉ።"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SUBMIT REQUEST */}
              {activeTab === "submit" && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-8 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6">
                    {language === "en" ? "Submit a Prayer Request" : "የጸሎት ጥያቄ ያቅርቡ"}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        {language === "en" ? "Title / Summary *" : "ርዕስ / ማጠቃለያ *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={
                          language === "en"
                            ? "e.g. Pray for my upcoming exams and health"
                            : "ለምሳሌ፡ ስለሚመጡት ፈተናዎች እና ጤና ጸልዩልኝ"
                        }
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-rose-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        {language === "en" ? "Category" : "ምድብ"}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-rose-500 text-xs"
                      >
                        <option value="healing">{language === "en" ? "Healing & Health" : "ፈውስ እና ጤና"}</option>
                        <option value="family">{language === "en" ? "Family & Relationships" : "ቤተሰብ እና ግንኙነት"}</option>
                        <option value="faith">{language === "en" ? "Faith & Spiritual Growth" : "እምነት እና መንፈሳዊ እድገት"}</option>
                        <option value="provision">{language === "en" ? "Provision & Job" : "አቅርቦት እና ሥራ"}</option>
                        <option value="guidance">{language === "en" ? "Guidance & Direction" : "መምሪያ እና አቅጣጫ"}</option>
                        <option value="other">{language === "en" ? "Other" : "ሌላ"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        {language === "en" ? "Prayer Details *" : "የጸሎት ዝርዝሮች *"}
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder={
                          language === "en"
                            ? "Share details about your prayer request..."
                            : "ስለ ጸሎት ጥያቄዎ ዝርዝሮችን ያካፍሉ..."
                        }
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-rose-500 text-xs resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <input
                        type="checkbox"
                        id="anonPrayer"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                      />
                      <label htmlFor="anonPrayer" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        {language === "en" ? "Post Anonymously (Hide my name)" : "ስሜን ደብቅ (በሚስጥር ለጥፍ)"}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                    >
                      {submitting
                        ? language === "en"
                          ? "Submitting..."
                          : "በማስገባት ላይ..."
                        : language === "en"
                        ? "Post Prayer Request"
                        : "የጸሎት ጥያቄ ለጥፍ"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
