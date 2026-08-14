"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Bell } from "lucide-react";

interface DashboardSummaryProps {
  user: any;
  isActive: boolean;
}

export function DashboardSummary({ user, isActive }: DashboardSummaryProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Return empty list by default or fetch
    setNotifications([
      { _id: "1", title: "Welcome to YABBOK!", message: "Your account has been fully verified and activated by the Super Admin. God bless you!", read: false, createdAt: new Date() },
      { _id: "2", title: "Bible Verse Daily", message: "Genesis 32:24 is your daily bread. Jacob was left alone...", read: true, createdAt: new Date() },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 shadow">
        <h2 className="text-2xl font-extrabold">
          {t("dashWelcome")}, {user?.name}!
        </h2>
        <p className="text-xs font-light text-slate-900 mt-1 max-w-xl">
          {!isActive 
            ? "Welcome to YABBOK. Your profile is currently pending approval. Please contact your local church leader to verify your registration, so you can participate in chats and discussions."
            : "Connect with the youth members across Kale Hiywet Churches. Participate in daily bible discussions, prayer lines, and read audio/video sermons."}
        </p>
      </div>

      {/* Daily Bread Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-500">
          💡 {t("dashVerse")}
        </span>
        <blockquote className="mt-2 text-base text-slate-800 dark:text-slate-200 italic leading-relaxed">
          &ldquo;{t("verseText")}&rdquo;
        </blockquote>
        <cite className="block mt-1.5 text-[10px] font-bold text-gold-700">
          — {t("verseRef")}
        </cite>
      </div>

      {/* Notifications Center */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
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
  );
}
