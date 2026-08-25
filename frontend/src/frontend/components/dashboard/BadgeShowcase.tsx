"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Shield, Book, Heart, Users } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function BadgeShowcase() {
  const { language } = useLanguage();
  const [badges, setBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/badges")
      .then((res) => res.json())
      .then((data) => {
        setBadges(data.allBadges || []);
        setEarnedBadges(data.earned ? data.earned.map((b: any) => b.badgeId) : []);
      })
      .catch((err) => console.error("Error loading badges:", err))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case "prayer_warrior": return <Shield className="w-8 h-8" />;
      case "bible_scholar": return <Book className="w-8 h-8" />;
      case "devotional_master": return <Heart className="w-8 h-8" />;
      case "fellowship_anchor": return <Users className="w-8 h-8" />;
      default: return <Shield className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
        🏆 Trophy Room
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Earn badges by participating in the community, reading devotionals, and praying for others.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {badges.map((badge, idx) => {
          const isEarned = earnedBadges.includes(badge.id);

          return (
            <motion.div
              key={badge.id}
              whileHover={isEarned ? { scale: 1.05, rotateY: 10 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}
              className={`relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                isEarned
                  ? "bg-gradient-to-br from-gold-500/20 to-amber-500/5 border-gold-500/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 grayscale"
              }`}
            >
              {!isEarned && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
              )}
              
              <div className={`p-4 rounded-full mb-3 ${isEarned ? 'bg-gold-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                {getIcon(badge.id)}
              </div>
              
              <h4 className={`text-sm font-bold ${isEarned ? 'text-gold-700 dark:text-gold-400' : 'text-slate-500'}`}>
                {language === "en" ? badge.nameEn : badge.nameAm}
              </h4>
              <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                {language === "en" ? badge.descriptionEn : badge.descriptionAm}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}