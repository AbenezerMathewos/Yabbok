"use client";

import React, { useEffect, useState } from "react";
import { fetchAnnouncements, sendAnnouncement } from "@/frontend/lib/api/adminApi";
import { fetchChurches } from "@/frontend/lib/api/churchesApi";
import { Megaphone, Loader2 } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function AdminAnnouncementsManager() {
  const { language } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    audience: "all",
    role: "member",
    churchId: "",
    userId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [annData, churchData] = await Promise.all([
        fetchAnnouncements(),
        fetchChurches()
      ]);
      setAnnouncements(annData as any[]);
      setChurches(churchData as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      alert("Please enter both title and message for the announcement.");
      return;
    }

    try {
      const data = await sendAnnouncement({
        ...newAnnouncement,
        title: newAnnouncement.title.trim(),
        message: newAnnouncement.message.trim(),
        role: newAnnouncement.audience === "role" ? newAnnouncement.role : undefined,
        churchId: newAnnouncement.audience === "church" ? newAnnouncement.churchId : undefined,
        userId: newAnnouncement.audience === "user" ? newAnnouncement.userId : undefined,
      });

      setNewAnnouncement({ title: "", message: "", audience: "all", role: "member", churchId: "", userId: "" });
      await loadData();
      alert(`Announcement sent successfully to ${data.recipientCount ?? 0} recipient(s).`);
    } catch (err) {
      console.error(err);
      alert("Announcement send failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={24} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-fit">
        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5 text-gold-500">
          <Megaphone size={18} />
          <span>Send Announcement</span>
        </h3>
        <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
          <input
            type="text"
            required
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            placeholder="Announcement title"
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
          />
          <textarea
            rows={4}
            required
            value={newAnnouncement.message}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
            placeholder="Message..."
            className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 resize-none"
          />
          <select
            value={newAnnouncement.audience}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
          >
            <option value="all">All active users</option>
            <option value="role">Specific role</option>
            <option value="church">Specific church</option>
            <option value="user">Specific user</option>
          </select>
          {newAnnouncement.audience === "role" && (
            <select
              value={newAnnouncement.role}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            >
              {["member", "youth_leader", "church_leader", "moderator", "admin"].map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          )}
          {newAnnouncement.audience === "church" && (
            <select
              value={newAnnouncement.churchId}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, churchId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            >
              <option value="">Select church</option>
              {churches.map((church: any) => (
                <option key={church._id} value={church._id}>{church.name}</option>
              ))}
            </select>
          )}
          {newAnnouncement.audience === "user" && (
            <input
              type="text"
              value={newAnnouncement.userId}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, userId: e.target.value })}
              placeholder="User ID"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          )}
          <button type="submit" className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl">
            Send Announcement
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider">Announcement History</h3>
        <div className="space-y-3">
          {announcements.map((announcement: any) => (
            <div key={announcement._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
              <div className="flex justify-between gap-4">
                <h4 className="font-bold text-slate-900 dark:text-white">{announcement.title}</h4>
                <span className="text-[10px] uppercase font-bold text-slate-400">{announcement.audience}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-2">{announcement.message}</p>
              <p className="text-[10px] text-slate-400 mt-2">
                By {announcement.createdBy?.name || "Admin"} · {new Date(announcement.createdAt).toLocaleString(language)}
              </p>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-10">
              No announcements have been sent yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
