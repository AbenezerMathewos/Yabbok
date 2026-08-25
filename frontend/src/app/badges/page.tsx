"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { Award, Lock, Sparkles, HelpCircle, Flame, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BadgesPage() {
  const { language } = useLanguage();
  const [badgeData, setBadgeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/badges")
      .then((r) => r.json())
      .then((data) => {
        setBadgeData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
              <Award size={16} />
              {language === "en" ? "Spiritual Milestones & Badges" : "የመንፈሳዊ ዕድገት ባጆች"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === "en" ? "Youth Achievement Showcase" : "የወጣቶች ስኬት እና ባጆች"}
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-xl mx-auto">
              {language === "en"
                ? "Unlock spiritual achievement badges by studying devotionals, praying for peers, attending retreats, and taking Bible quizzes!"
                : "በቃሉ ጥናት፣ በጸሎት፣ በኮንፈረንስ እና በመጽሐፍ ቅዱስ ጥያቄዎች የተገኙ የመንፈሳዊ ዕድገት ባጆች።"}
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-black text-gold-400">
                {badgeData?.totalUnlocked || 0} / {badgeData?.badges?.length || 4}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                {language === "en" ? "Badges Unlocked" : "የተከፈቱ ባጆች"}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <span className="text-2xl font-black text-rose-400 flex items-center justify-center gap-1">
                <Flame size={20} className="fill-current" /> 7
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                {language === "en" ? "Quiet Time Streak" : "የተከታታይ ቃል ጥናት"}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center flex items-center justify-center">
              <Link
                href="/quiz"
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-2 shadow"
              >
                <HelpCircle size={16} />
                {language === "en" ? "Take Bible Quiz" : "ጥያቄዎችን ይውሰዱ"}
              </Link>
            </div>
          </div>

          {/* Badges Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="h-40 rounded-3xl bg-slate-900" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {badgeData?.badges?.map((badge: any, i: number) => (
                <motion.div
                  key={badge.badgeId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-3xl border flex items-start gap-4 transition-all duration-300 ${
                    badge.unlocked
                      ? "bg-slate-900 border-gold-500/40 shadow-xl shadow-gold-500/5"
                      : "bg-slate-950 border-slate-900 opacity-60"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                    badge.unlocked
                      ? "bg-gold-500/20 border-gold-500/40"
                      : "bg-slate-900 border-slate-800"
                  }`}>
                    {badge.unlocked ? badge.icon : <Lock size={24} className="text-slate-600" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white">
                        {language === "en" ? badge.nameEn : badge.nameAm}
                      </h3>
                      {badge.unlocked && (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === "en" ? badge.descriptionEn : badge.descriptionAm}
                    </p>
                    <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest pt-1 block">
                      {badge.unlocked
                        ? language === "en" ? "Unlocked" : "ተከፍቷል"
                        : language === "en" ? "Locked (Complete Tasks)" : "የተቆለፈ (ጥያቄዎችን ይጨርሱ)"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
