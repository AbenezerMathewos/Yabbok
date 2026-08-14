"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Search, X, BookOpen, Calendar, Heart, HandHeart, Users, Briefcase, Shield, Sparkles, MessageSquareHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allItems = [
    { href: "/devotional", titleEn: "Daily Devotional & Quiet Time", titleAm: "የእለት ተእለት ቃል", icon: <BookOpen size={16} className="text-gold-500" /> },
    { href: "/sermons", titleEn: "Sermons & Audio Teachings", titleAm: "ስብከቶች እና የድምጽ ትምህርቶች", icon: <BookOpen size={16} className="text-blue-500" /> },
    { href: "/events", titleEn: "Fellowship Events & Retreats", titleAm: "የህብረት ዝግጅቶች", icon: <Calendar size={16} className="text-emerald-500" /> },
    { href: "/prayer", titleEn: "Prayer Wall & Testimonies", titleAm: "የጸሎት ግድግዳ እና ምስክርነቶች", icon: <MessageSquareHeart size={16} className="text-rose-500" /> },
    { href: "/mutual-aid", titleEn: "Mutual Aid Network", titleAm: "የእርስ በእርስ እርዳታ", icon: <HandHeart size={16} className="text-orange-500" /> },
    { href: "/volunteer", titleEn: "Volunteer Opportunities", titleAm: "የበጎ ፈቃደኝነት እድሎች", icon: <Users size={16} className="text-teal-500" /> },
    { href: "/mentorship", titleEn: "Spiritual Mentorship", titleAm: "የአማካሪነት አገልግሎት", icon: <Briefcase size={16} className="text-amber-500" /> },
    { href: "/counseling", titleEn: "Pastoral Counseling & Triage", titleAm: "የእረኝነት ምክር", icon: <Heart size={16} className="text-indigo-500" /> },
    { href: "/benevolence", titleEn: "Crisis Benevolence Fund", titleAm: "የበጎ አድራጎት ፈንድ", icon: <Sparkles size={16} className="text-purple-500" /> },
    { href: "/gallery", titleEn: "Photo Gallery", titleAm: "የፎቶ ቤተ-ስዕል", icon: <Heart size={16} className="text-pink-500" /> },
    { href: "/admin", titleEn: "Admin Dashboard", titleAm: "የአስተዳዳሪ ሰሌዳ", icon: <Shield size={16} className="text-gold-400" /> },
  ];

  const filtered = allItems.filter((item) => {
    const title = language === "en" ? item.titleEn : item.titleAm;
    return title.toLowerCase().includes(query.toLowerCase());
  });

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden"
        >
          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder={
                language === "en"
                  ? "Type a command or search page... (e.g. Prayer, Sermons)"
                  : "ገጽ ወይም አገልግሎት ይፈልጉ... (ለምሳሌ፡ ጸሎት፣ ስብከት)"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none font-medium"
            />
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              ESC
            </button>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                      {item.icon}
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {language === "en" ? item.titleEn : item.titleAm}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-gold-500 font-bold">
                    Go →
                  </span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                {language === "en" ? "No matching pages found." : "ምንም የሚመሳሰሉ ገጾች አልተገኙም።"}
              </div>
            )}
          </div>

          {/* Footer keyboard hint */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
            <span>YABBOK Fellowship Spotlight</span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">↑↓</span>
              <span>{language === "en" ? "Navigate" : "ይቀይሩ"}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">↵</span>
              <span>{language === "en" ? "Select" : "ይምረጡ"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
