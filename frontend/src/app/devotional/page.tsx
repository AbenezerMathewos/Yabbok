"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { BookOpen, CheckCircle, Flame, Calendar, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function DevotionalPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as any;

  const [devotional, setDevotional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/devotional")
      .then((res) => res.json())
      .then((data) => {
        setDevotional(data);
        if (user && data.completedUsers?.includes(user.id)) {
          setCompleted(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleComplete = async () => {
    if (!session) {
      toast.error(language === "en" ? "Please login to record quiet time!" : "ጸሎትዎን ለመመዝገብ እባክዎ ይግቡ!");
      return;
    }
    try {
      const res = await fetch("/api/devotional", { method: "POST" });
      if (res.ok) {
        setCompleted(true);
        toast.success(
          language === "en"
            ? "Quiet Time completed! Keep your spiritual streak burning!"
            : "የግል ጸሎትዎ ተጠናቋል! መንፈሳዊ ጉዞዎን ይቀጥሉ!"
        );
      }
    } catch (err) {
      toast.error(language === "en" ? "An error occurred" : "ስህተት ተከስቷል");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs font-bold uppercase tracking-widest mb-4">
              <Flame size={16} className="text-gold-500 animate-bounce" />
              {language === "en" ? "Daily Quiet Time & Devotional" : "የእለት ተእለት የግል ጸሎት እና ቃል"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
              {language === "en" ? "Bread of Life" : "የሕይወት እንጀራ"}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              {language === "en"
                ? "Start your morning rooted in Scripture. Read today's passage and meditate on God's truth."
                : "ጠዋትዎን በእግዚአብሔር ቃል ላይ በመመሥረት ይጀምሩ። የዛሬውን የመጽሐፍ ቅዱስ ቃል ያንብቡ እና ያሰላስሉ።"}
            </p>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/60 shadow-xl space-y-6">
              <Skeleton className="h-6 w-1/4 rounded-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-xl overflow-hidden">
              
              {/* Top date bar */}
              <div className="bg-slate-950 p-6 text-white flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {language === "en" ? "Today's Date" : "የዛሬ ቀን"}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {new Date().toLocaleDateString(language === "en" ? "en-US" : "am-ET", { dateStyle: "full" })}
                    </span>
                  </div>
                </div>

                {completed && (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    {language === "en" ? "Completed Today" : "ዛሬ ተጠናቋል"}
                  </span>
                )}
              </div>

              {/* Main Devotional Body */}
              <div className="p-8 space-y-8">
                
                {/* Scripture Card */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-gold-500/10 via-amber-500/5 to-transparent border border-gold-500/20 text-center space-y-4">
                  <span className="px-3 py-1 rounded-full bg-gold-500 text-slate-950 text-[10px] font-black uppercase tracking-widest inline-block shadow">
                    {devotional.verseRef}
                  </span>
                  <blockquote className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed italic">
                    "{language === "en" ? devotional.verseEn : devotional.verseAm}"
                  </blockquote>
                </div>

                {/* Reflection Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gold-500 flex items-center gap-2">
                    <Sparkles size={16} />
                    {language === "en" ? "Daily Spiritual Reflection" : "የእለት ተእለት መንፈሳዊ አስተንትኖ"}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium">
                    {language === "en" ? devotional.reflectionEn : devotional.reflectionAm}
                  </p>
                </div>

                {/* Author attribution */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <span>
                    ✍️ {language === "en" ? "Authored by:" : "ደራሲ፡"} <strong className="text-slate-900 dark:text-white">{devotional.author}</strong>
                  </span>
                  <span className="font-semibold text-gold-500">
                    🔥 {devotional.completedUsers?.length || 0} {language === "en" ? "Youth Completed" : "ወጣቶች አጠናቀዋል"}
                  </span>
                </div>

                {/* Complete Quiet Time Action */}
                <div className="pt-4">
                  <button
                    onClick={handleComplete}
                    disabled={completed}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      completed
                        ? "bg-emerald-500 text-white cursor-default"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-gold-500 dark:hover:bg-gold-500 hover:text-slate-950 transition-transform active:scale-[0.99]"
                    }`}
                  >
                    <CheckCircle size={18} />
                    {completed
                      ? language === "en"
                        ? "Quiet Time Recorded for Today!"
                        : "የዛሬው ጸሎትዎ ተመዝግቧል!"
                      : language === "en"
                      ? "Complete Quiet Time & Boost Streak"
                      : "ጸሎቴን አጠናቅቄአለሁ"}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
