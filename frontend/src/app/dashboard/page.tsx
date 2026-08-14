"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { 
  User, 
  Heart, 
  MessageSquare, 
  FileText, 
  Settings, 
  MessageCircle, 
  ChevronRight, 
  Loader2
} from "lucide-react";

// Sub-components
import { DashboardSummary } from "@/frontend/components/dashboard/DashboardSummary";
import { DashboardFeeds } from "@/frontend/components/dashboard/DashboardFeeds";
import { DashboardDiscussions } from "@/frontend/components/dashboard/DashboardDiscussions";
import { DashboardChat } from "@/frontend/components/dashboard/DashboardChat";
import { DashboardSuggestions } from "@/frontend/components/dashboard/DashboardSuggestions";
import { DashboardProfile } from "@/frontend/components/dashboard/DashboardProfile";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const isActive = user?.status === "active";

  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Controls (1/4) */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Avatar panel */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm text-center">
                <div className="relative inline-block mb-3">
                  {user?.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-20 h-20 rounded-full border-2 border-gold-500 mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gold-500 text-white flex items-center justify-center text-3xl font-extrabold mx-auto shadow-inner">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
                </div>
                <h2 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">
                  {user?.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-500 block mt-1">
                  🛡️ {user?.role?.replace("_", " ")}
                </span>
                
                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {t("dashStatus")}
                  </span>
                  {isActive ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ✅ {t("dashStatusActive")}
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                      ⏳ {t("dashStatusPending")}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-1">
                {[
                  { id: "summary", label: t("navDashboard"), icon: <User size={16} /> },
                  { id: "feeds", label: language === 'en' ? 'Fellowship Wall' : 'የህብረት ግንብ', icon: <Heart size={16} />, activeOnly: true },
                  { id: "discussions", label: language === 'en' ? 'Bible Forum' : 'የውይይት መድረክ', icon: <MessageSquare size={16} />, activeOnly: true },
                  { id: "chat", label: language === 'en' ? 'Chat Rooms' : 'የመወያያ ክፍሎች', icon: <MessageCircle size={16} />, activeOnly: true },
                  { id: "suggestions", label: t("tabSuggestions"), icon: <FileText size={16} />, activeOnly: true },
                  { id: "profile", label: t("dashEditProfile"), icon: <Settings size={16} /> },
                ].map((tab) => {
                  if (tab.activeOnly && !isActive) return null;
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={12} className={isCurrent ? "text-gold-500" : "text-slate-400"} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Workspace Contents (3/4) */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === "summary" && <DashboardSummary user={user} isActive={isActive} />}
              {activeTab === "feeds" && isActive && <DashboardFeeds user={user} />}
              {activeTab === "discussions" && isActive && <DashboardDiscussions />}
              {activeTab === "chat" && isActive && <DashboardChat user={user} isActive={isActive} />}
              {activeTab === "suggestions" && isActive && <DashboardSuggestions />}
              {activeTab === "profile" && <DashboardProfile />}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
