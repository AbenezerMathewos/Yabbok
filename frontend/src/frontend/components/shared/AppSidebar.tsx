"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  MessageCircle,
  FileText,
  Settings,
  BookOpen,
  Calendar,
  Image as Gallery,
  Church,
  Users,
  Handshake,
  Brain,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  Globe,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useLanguage() as any;
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const user = session?.user as any;
  const isActive = user?.status === "active";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isDashboard = pathname === "/dashboard";

  // Navigation items for the DASHBOARD tab view
  const dashboardTabs = [
    { id: "summary", label: t("navDashboard") || "Overview", icon: LayoutDashboard },
    { id: "feeds", label: language === "en" ? "Fellowship Wall" : "የህብረት ግንብ", icon: Heart, activeOnly: true },
    { id: "discussions", label: language === "en" ? "Bible Forum" : "የውይይት መድረክ", icon: MessageSquare, activeOnly: true },
    { id: "chat", label: language === "en" ? "Chat Rooms" : "የመወያያ ክፍሎች", icon: MessageCircle, activeOnly: true },
    { id: "suggestions", label: t("tabSuggestions") || "Suggestions", icon: FileText, activeOnly: true },
    { id: "profile", label: t("dashEditProfile") || "Profile", icon: Settings },
  ];

  // Global nav links  
  const globalLinks = [
    { href: "/sermons", label: language === "en" ? "Sermons" : "ስብከቶች", icon: BookOpen },
    { href: "/events", label: language === "en" ? "Events" : "ዝግጅቶች", icon: Calendar },
    { href: "/churches", label: language === "en" ? "Churches" : "አብያተ ክርስቲያናት", icon: Church },
    { href: "/gallery", label: language === "en" ? "Gallery" : "ምስሎች", icon: Gallery },
  ];

  const communityLinks = [
    { href: "/volunteer", label: language === "en" ? "Volunteer" : "በጎ ፈቃደኛ", icon: Handshake },
    { href: "/mentorship", label: language === "en" ? "Mentorship" : "አማካሪ", icon: Users },
    { href: "/counseling", label: language === "en" ? "Counseling" : "ምክር", icon: Brain },
    { href: "/benevolence", label: language === "en" ? "Benevolence" : "ቤኔቮለንስ", icon: ShieldAlert },
    { href: "/mutual-aid", label: language === "en" ? "Mutual Aid" : "ድጋፍ", icon: Heart },
  ];

  const sidebarWidth = collapsed ? "w-[70px]" : "w-[260px]";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 70 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0 gold-glow">
          <BookOpen size={18} className="text-slate-950" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sidebar-foreground font-black text-base leading-none">Yabbok</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Fellowship</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable nav body ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-2">

        {/* DASHBOARD TAB SECTION */}
        {isDashboard && onTabChange && (
          <div className="mb-4">
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground px-2 mb-2">
                {language === "en" ? "Dashboard" : "ዳሽቦርድ"}
              </p>
            )}
            {dashboardTabs.map((tab) => {
              if (tab.activeOnly && !isActive) return null;
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  title={collapsed ? tab.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="truncate"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
            {!collapsed && <Separator className="my-3 bg-sidebar-border" />}
          </div>
        )}

        {/* MEDIA / GLOBAL */}
        {!collapsed && (
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground px-2 mb-2">
            {language === "en" ? "Media" : "ሚዲያ"}
          </p>
        )}
        {globalLinks.map((link) => {
          const Icon = link.icon;
          const isCurrent = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={collapsed ? link.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {!collapsed && <Separator className="my-3 bg-sidebar-border" />}

        {/* COMMUNITY CARE */}
        {isActive && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground px-2 mb-2">
                {language === "en" ? "Community Care" : "ማህበረሰብ"}
              </p>
            )}
            {communityLinks.map((link) => {
              const Icon = link.icon;
              const isCurrent = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <>
            {!collapsed && <Separator className="my-3 bg-sidebar-border" />}
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground px-2 mb-2">
                {language === "en" ? "Administration" : "አስተዳደር"}
              </p>
            )}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === "/admin"
                  ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={collapsed ? "Admin Panel" : undefined}
            >
              <Shield size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-2">
        {/* Theme & Language */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "am" : "en")}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
            >
              <Globe size={14} />
              {language === "en" ? "አማ" : "EN"}
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent transition-all ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="w-9 h-9 shrink-0 border-2 border-primary">
            <AvatarImage src={user?.profilePhoto} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-bold text-sidebar-foreground truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider truncate">{user?.role?.replace("_", " ")}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center shadow-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
