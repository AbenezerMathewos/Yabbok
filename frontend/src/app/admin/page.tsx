"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, MapPin, FileText, AlertTriangle, Loader2,
  Activity, Image as ImageIcon, Megaphone, Search, Bell
} from "lucide-react";

import { AppSidebar } from "@/frontend/components/shared/AppSidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import Refactored Sub-components
import { AdminAnalytics } from "@/frontend/components/admin/AdminAnalytics";
import { AdminUsersManager } from "@/frontend/components/admin/AdminUsersManager";
import { AdminChurchesManager } from "@/frontend/components/admin/AdminChurchesManager";
import { AdminGalleryManager } from "@/frontend/components/admin/AdminGalleryManager";
import { AdminModerationQueue } from "@/frontend/components/admin/AdminModerationQueue";
import { AdminAnnouncementsManager } from "@/frontend/components/admin/AdminAnnouncementsManager";
import { AdminSuggestionsManager } from "@/frontend/components/admin/AdminSuggestionsManager";
import { AdminAuditLogs } from "@/frontend/components/admin/AdminAuditLogs";
import { AdminSermonsManager } from "@/frontend/components/admin/AdminSermonsManager";
import { AdminEventsManager } from "@/frontend/components/admin/AdminEventsManager";
import { Video, Calendar } from "lucide-react";

const TAB_LABELS: Record<string, { en: string; am: string; icon: any }> = {
  analytics:     { en: "Stats & Analytics", am: "ስታቲስቲክስ", icon: Activity },
  users:         { en: "Member Management", am: "አባላት", icon: Users },
  churches:      { en: "Church Network", am: "አብያተ ክርስቲያናት", icon: MapPin },
  sermons:       { en: "Sermons Manager", am: "ስብከት", icon: Video },
  events:        { en: "Events Manager", am: "ዝግጅቶች", icon: Calendar },
  gallery:       { en: "Gallery Manager", am: "ፎቶዎች", icon: ImageIcon },
  moderation:    { en: "Moderation Queue", am: "ቁጥጥር", icon: AlertTriangle },
  suggestions:   { en: "Suggestions", am: "ሃሳቦች", icon: FileText },
  announcements: { en: "Announcements", am: "ማስታወቂያዎች", icon: Megaphone },
  logs:          { en: "Audit Logs", am: "ኦዲት", icon: Shield },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const isAdmin = ["super_admin", "admin", "moderator", "church_leader"].includes(user?.role);
  const canManageChurches = ["admin", "super_admin"].includes(user?.role);
  const canApproveChurches = user?.role === "super_admin";

  const [activeSubTab, setActiveSubTab] = useState("analytics");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !session || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950/85 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center animate-pulse">
            <Shield size={28} className="text-slate-950" />
          </div>
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "analytics", label: TAB_LABELS.analytics[language as "en" | "am"], icon: Activity },
    { id: "users", label: TAB_LABELS.users[language as "en" | "am"], icon: Users },
    { id: "churches", label: TAB_LABELS.churches[language as "en" | "am"], icon: MapPin, adminOnly: true },
    { id: "gallery", label: TAB_LABELS.gallery[language as "en" | "am"], icon: ImageIcon },
    { id: "moderation", label: TAB_LABELS.moderation[language as "en" | "am"], icon: AlertTriangle },
    { id: "suggestions", label: TAB_LABELS.suggestions[language as "en" | "am"], icon: FileText },
    { id: "announcements", label: TAB_LABELS.announcements[language as "en" | "am"], icon: Megaphone },
    { id: "logs", label: TAB_LABELS.logs[language as "en" | "am"], icon: Shield, superAdminOnly: true },
  ];

  const CurrentTabMeta = TAB_LABELS[activeSubTab] ?? TAB_LABELS.analytics;
  const TabIcon = CurrentTabMeta.icon;
  const tabTitle = CurrentTabMeta[language as "en" | "am"];

  return (
    <div className="flex h-screen bg-slate-950/85 backdrop-blur-2xl overflow-hidden">
      {/* ── Main Global Sidebar ── */}
      <AppSidebar />

      {/* ── Admin Sub-Sidebar ── */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 px-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="font-black text-sm text-foreground leading-tight">Admin Center</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground px-2 mb-2 mt-2">
            {language === "en" ? "Management" : "አስተዳደር"}
          </p>
          {tabs.map((tab) => {
            if (tab.adminOnly && !canManageChurches) return null;
            if (tab.superAdminOnly && user.role !== "super_admin") return null;
            const Icon = tab.icon;
            const isCurrent = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background flex items-center gap-4 px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TabIcon size={18} className="text-primary" />
            </div>
            <h1 className="text-base font-black text-foreground leading-none">{tabTitle}</h1>
          </div>

          <div className="relative hidden md:flex items-center w-56">
            <Search size={15} className="absolute left-3 text-muted-foreground" />
            <Input placeholder={language === "en" ? "Search admin..." : "ፈልግ..."} className="pl-9 h-9 rounded-full bg-muted/50 border-border/50 text-sm focus-visible:ring-primary" />
          </div>

          <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Bell size={20} />
          </button>

          <Avatar className="w-9 h-9 border-2 border-primary">
            <AvatarImage src={user?.profilePhoto} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSubTab === "analytics" && <AdminAnalytics />}
              {activeSubTab === "users" && <AdminUsersManager currentUserRole={user.role} />}
              {activeSubTab === "churches" && <AdminChurchesManager canManageChurches={canManageChurches} canApproveChurches={canApproveChurches} />}
              {activeSubTab === "sermons" && <AdminSermonsManager />}
              {activeSubTab === "events" && <AdminEventsManager />}
              {activeSubTab === "gallery" && <AdminGalleryManager />}
              {activeSubTab === "moderation" && <AdminModerationQueue currentUserRole={user.role} />}
              {activeSubTab === "suggestions" && <AdminSuggestionsManager />}
              {activeSubTab === "announcements" && <AdminAnnouncementsManager />}
              {activeSubTab === "logs" && user.role === "super_admin" && <AdminAuditLogs />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
