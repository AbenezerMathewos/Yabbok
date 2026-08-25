"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Heart, MessageSquare, FileText, Settings, MessageCircle, Loader2,
  TrendingUp, Bell, Search, BookOpen,
} from "lucide-react";
import { AppSidebar } from "@/frontend/components/shared/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sub-components
import { DashboardSummary } from "@/frontend/components/dashboard/DashboardSummary";
import { DashboardFeeds } from "@/frontend/components/dashboard/DashboardFeeds";
import { DashboardDiscussions } from "@/frontend/components/dashboard/DashboardDiscussions";
import { DashboardChat } from "@/frontend/components/dashboard/DashboardChat";
import { DashboardSuggestions } from "@/frontend/components/dashboard/DashboardSuggestions";
import { DashboardProfile } from "@/frontend/components/dashboard/DashboardProfile";

const TAB_LABELS: Record<string, { en: string; am: string; icon: any }> = {
  summary:     { en: "Overview", am: "አጠቃላይ", icon: TrendingUp },
  feeds:       { en: "Fellowship Wall", am: "የህብረት ግንብ", icon: Heart },
  discussions: { en: "Bible Forum", am: "የውይይት መድረክ", icon: MessageSquare },
  chat:        { en: "Chat Rooms", am: "የመወያያ ክፍሎች", icon: MessageCircle },
  suggestions: { en: "Suggestions", am: "ሃሳቦች", icon: FileText },
  profile:     { en: "Profile", am: "ፕሮፋይል", icon: Settings },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const user = session?.user as any;
  const isActive = user?.status === "active";

  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950/85 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center animate-pulse">
            <BookOpen size={28} className="text-slate-950" />
          </div>
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      </div>
    );
  }

  const CurrentTabMeta = TAB_LABELS[activeTab] ?? TAB_LABELS.summary;
  const TabIcon = CurrentTabMeta.icon;
  const tabTitle = language === "en" ? CurrentTabMeta.en : CurrentTabMeta.am;

  return (
    <div className="flex h-screen bg-slate-950/85 backdrop-blur-2xl overflow-hidden">
      {/* ── Sidebar ── */}
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-sm flex items-center gap-4 px-6 shrink-0 sticky top-0 z-10">
          {/* Page title */}
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <TabIcon size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-base font-black text-foreground leading-none">{tabTitle}</h1>
              {!isActive && (
                <p className="text-[10px] text-amber-500 font-bold mt-0.5 animate-pulse">
                  {language === "en" ? "Pending approval" : "ፍቃድ ይጠበቃል"}
                </p>
              )}
            </div>
          </div>

          {/* Search — desktop only */}
          <div className="relative hidden md:flex items-center w-56">
            <Search size={15} className="absolute left-3 text-muted-foreground" />
            <Input
              placeholder={language === "en" ? "Search…" : "ፈልግ…"}
              className="pl-9 h-9 rounded-full bg-muted/50 border-border/50 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          {/* User avatar (compact) */}
          <Avatar className="w-9 h-9 border-2 border-primary cursor-pointer" onClick={() => setActiveTab("profile")}>
            <AvatarImage src={user?.profilePhoto} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Scrollable workspace */}
        <main className="flex-1 overflow-y-auto">
          {/* Pending member banner */}
          {!isActive && (
            <div className="mx-6 mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {language === "en" ? "Account Pending Approval" : "አካውንት ፍቃድ ይጠበቃል"}
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                  {language === "en"
                    ? "A church leader will review your registration and approve your membership soon."
                    : "የቤተ ክርስቲያን መሪ ምዝገባዎን ይገምሙና ብዙ ሳይቆይ ያጸድቃሉ።"}
                </p>
              </div>
            </div>
          )}

          {/* Tab content with animation */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "summary"     && <DashboardSummary user={user} isActive={isActive} />}
                {activeTab === "feeds"       && isActive && <DashboardFeeds user={user} />}
                {activeTab === "discussions" && isActive && <DashboardDiscussions />}
                {activeTab === "chat"        && isActive && <DashboardChat user={user} isActive={isActive} />}
                {activeTab === "suggestions" && isActive && <DashboardSuggestions />}
                {activeTab === "profile"     && <DashboardProfile />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
