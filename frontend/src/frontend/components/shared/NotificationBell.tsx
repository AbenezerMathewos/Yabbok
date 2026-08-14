"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Bell, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const { session } = useSession() as any;
  const { language } = useLanguage();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const toggleDropdown = () => {
    if (!isOpen && unreadCount > 0) {
      markAllRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={14} className="text-gold-500" />
                {language === "en" ? "Notifications" : "ማሳወቂያዎች"}
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-gold-500 font-bold hover:underline"
                >
                  {language === "en" ? "Mark all read" : "ሁሉንም እንደተነበበ አድርግ"}
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 text-xs space-y-1 transition-colors ${
                      !n.read ? "bg-gold-500/5 dark:bg-gold-500/10" : ""
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-400 block font-semibold">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Info size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">
                    {language === "en" ? "No new notifications" : "ምንም አዲስ ማሳወቂያ የለም"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
