"use client";

import React, { useEffect, useState } from "react";
import { fetchAdminStats } from "@/frontend/lib/api/adminApi";
import { Users, AlertTriangle, MapPin, Calendar, Loader2 } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function AdminAnalytics() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t("adminTotalUsers"), val: stats.totalUsers, icon: <Users size={20} className="text-gold-500" /> },
          { title: "Pending approvals", val: stats.pendingUsers, icon: <AlertTriangle size={20} className="text-amber-500" /> },
          { title: t("adminTotalChurches"), val: stats.totalChurches, icon: <MapPin size={20} className="text-gold-500" /> },
          { title: t("adminTotalEvents"), val: stats.totalEvents, icon: <Calendar size={20} className="text-gold-500" /> },
        ].map((card, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">{card.title}</span>
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1 block">{card.val}</span>
            </div>
            {card.icon}
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider">
          Engagement Metrics Summary
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.totalPrayers}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Prayer Requests</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.totalTestimonies}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Testimonies Post</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.totalSuggestions}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Suggestions Sub</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.pendingContent}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Pending Content</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.openReports}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Open Reports</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <span className="text-2xl font-extrabold text-gold-500">{stats.totalAnnouncements}</span>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
