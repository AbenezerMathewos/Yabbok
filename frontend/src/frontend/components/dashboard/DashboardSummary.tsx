"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Bell, Heart, Calendar, PlusCircle, CheckCircle2, BookOpen } from "lucide-react";
import { BackgroundGeometric } from "@/components/ui/background-geometric";
import { DivineOrb } from "@/components/ui/divine-orb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DashboardSummaryProps {
  user: any;
  isActive: boolean;
}

export function DashboardSummary({ user, isActive }: DashboardSummaryProps) {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [devotional, setDevotional] = useState<any>(null);
  const [loadingDevo, setLoadingDevo] = useState(true);

  // Mock streak for UI demonstration (e.g., 4 days completed out of 7)
  const currentStreak = 4;

  useEffect(() => {
    // Fetch notifications
    setNotifications([
      { _id: "1", title: "Welcome to YABBOK!", message: "Your account has been fully verified and activated. God bless you!", read: false, createdAt: new Date() },
    ]);

    // Fetch today's devotional
    const fetchDevotional = async () => {
      try {
        const res = await fetch("/api/devotional");
        if (res.ok) {
          const data = await res.json();
          setDevotional(data);
        }
      } catch (err) {
        console.error("Failed to load devotional", err);
      } finally {
        setLoadingDevo(false);
      }
    };
    fetchDevotional();
  }, []);

  const handleMarkDevoComplete = async () => {
    try {
      const res = await fetch("/api/devotional", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDevotional(data.devotional);
        toast.success(language === "en" ? "Devotional marked as read!" : "ተነቦ አልቋል!");
        if (data.unlockedBadge) {
          toast.success(`🎉 You earned the ${data.unlockedBadge.badgeId} badge!`);
        }
      }
    } catch (err) {
      toast.error("Failed to complete devotional.");
    }
  };

  const isCompletedToday = devotional?.completedUsers?.includes(user?.id);

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800 p-8 flex flex-col justify-end min-h-[220px]">
        {/* Absolute Background */}
        <BackgroundGeometric className="absolute inset-0 z-0 !opacity-100" color1="#d97706" color2="#fbbf24" speed={0.5} />
        
        {/* 3D Liquid Gold Orb */}
        <DivineOrb />

        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-950/20 z-0" />

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
            {t("dashWelcome")}, {user?.name}!
          </h2>
          <p className="text-sm font-medium text-slate-200 mt-2 max-w-xl drop-shadow">
            {!isActive 
              ? "Your profile is pending approval. Please contact your local church leader to participate in chats and discussions."
              : "Connect with the youth members across Kale Hiywet Churches. Continue your daily walk with Christ today."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Left Column: Daily Walk (Span 2) ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Daily Devotional Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-500 flex items-center gap-2">
                <BookOpen size={16} /> {t("dashVerse")}
              </span>
              <Badge variant={isCompletedToday ? "default" : "secondary"}>
                {isCompletedToday ? "Completed" : "Pending"}
              </Badge>
            </div>

            {loadingDevo ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            ) : devotional ? (
              <>
                <blockquote className="text-lg md:text-xl text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed">
                  &ldquo;{language === "en" ? devotional.verseEn : devotional.verseAm}&rdquo;
                </blockquote>
                <cite className="block mt-2 text-sm font-bold text-gold-700">
                  — {devotional.verseRef}
                </cite>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  {language === "en" ? devotional.reflectionEn : devotional.reflectionAm}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Streak Tracker Visual */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Streak</span>
                    <div className="flex gap-1.5">
                      {[...Array(7)].map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i < currentStreak 
                              ? "bg-gold-500 text-white shadow-sm" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          }`}
                        >
                          {i < currentStreak ? "✓" : i + 1}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {!isCompletedToday && (
                    <Button onClick={handleMarkDevoComplete} className="bg-gold-600 hover:bg-gold-700 text-white font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Read
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No devotional found for today.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl">
              <Heart className="w-5 h-5 text-rose-500" />
              <span className="text-xs font-semibold">Post a Prayer</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-xl">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold">Find Events</span>
            </Button>
          </div>
        </div>

        {/* ── Right Column: Notifications & Activity ── */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-full">
            <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center gap-2 mb-4">
              <Bell size={18} className="text-gold-500" />
              <span>Notifications Center</span>
            </h3>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div key={notif._id} className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-colors ${
                    notif.read 
                      ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/55 text-slate-500" 
                      : "bg-gold-500/5 dark:bg-gold-500/10 border-gold-500/20 text-slate-800 dark:text-slate-100"
                  }`}>
                    <div>
                      <h4 className="font-bold text-xs">{notif.title}</h4>
                      <p className="text-xs mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium shrink-0">
                      Just now
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No new notifications.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

