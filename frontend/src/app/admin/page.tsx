"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import {
  Shield, 
  Users, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  Loader2, 
  Activity,
  Image as ImageIcon,
  Megaphone,
  Flag
} from "lucide-react";

// Import Refactored Sub-components
import { AdminAnalytics } from "@/frontend/components/admin/AdminAnalytics";
import { AdminUsersManager } from "@/frontend/components/admin/AdminUsersManager";
import { AdminChurchesManager } from "@/frontend/components/admin/AdminChurchesManager";
import { AdminGalleryManager } from "@/frontend/components/admin/AdminGalleryManager";
import { AdminModerationQueue } from "@/frontend/components/admin/AdminModerationQueue";
import { AdminAnnouncementsManager } from "@/frontend/components/admin/AdminAnnouncementsManager";
import { AdminSuggestionsManager } from "@/frontend/components/admin/AdminSuggestionsManager";
import { AdminAuditLogs } from "@/frontend/components/admin/AdminAuditLogs";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const user = session?.user as any;
  const isAdmin = ["super_admin", "admin", "moderator", "church_leader"].includes(user?.role);
  const canManageChurches = ["admin", "super_admin"].includes(user?.role);
  const canApproveChurches = user?.role === "super_admin";

  const [activeSubTab, setActiveSubTab] = useState("analytics");

  // AUTH PROTECTION
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !session || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm text-center">
                <Shield size={36} className="text-gold-500 mx-auto mb-3" />
                <h2 className="font-extrabold text-base text-slate-950 dark:text-white">
                  {t("adminTitle")}
                </h2>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                  Active User: {user.name} ({user.role?.replace("_", " ")})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-1">
                {[
                  { id: "analytics", label: "Stats & Analytics", icon: <Activity size={16} /> },
                  { id: "users", label: t("adminMembers"), icon: <Users size={16} /> },
                  { id: "churches", label: t("adminChurchMgt"), icon: <MapPin size={16} />, adminOnly: true },
                  { id: "gallery", label: "Gallery Management", icon: <ImageIcon size={16} /> },
                  { id: "moderation", label: "Moderation Queue", icon: <AlertTriangle size={16} /> },
                  { id: "suggestions", label: "Suggestions Moderate", icon: <FileText size={16} /> },
                  { id: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
                  { id: "logs", label: t("adminAuditLogs"), icon: <Shield size={16} />, superAdminOnly: true },
                ].map((tab) => {
                  if (tab.adminOnly && !canManageChurches) return null;
                  if (tab.superAdminOnly && user.role !== "super_admin") return null;
                  const isCurrent = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Workspaces */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {activeSubTab === "analytics" && <AdminAnalytics />}
                {activeSubTab === "users" && <AdminUsersManager currentUserRole={user.role} />}
                {activeSubTab === "churches" && <AdminChurchesManager canManageChurches={canManageChurches} canApproveChurches={canApproveChurches} />}
                {activeSubTab === "gallery" && <AdminGalleryManager />}
                {activeSubTab === "moderation" && <AdminModerationQueue currentUserRole={user.role} />}
                {activeSubTab === "suggestions" && <AdminSuggestionsManager />}
                {activeSubTab === "announcements" && <AdminAnnouncementsManager />}
                {activeSubTab === "logs" && user.role === "super_admin" && <AdminAuditLogs />}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
