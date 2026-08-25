"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./CommandPalette";
import { Menu, X, ChevronDown, LogOut, Shield, Heart, Users, BookOpen, HandHeart, Calendar, MapPin, Briefcase, MessageSquareHeart, Search, Radio, HelpCircle, Award, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  const user = session?.user as any;
  const isApproved = user?.status === "active";
  const role = user?.role;

  // Grouped Navigation Data
  const navGroups = [
    {
      label: language === 'en' ? "About Us" : "ስለ እኛ",
      key: "about",
      items: [
        { href: "/about", label: t("navAbout"), icon: <Users size={16} />, show: true },
        { href: "/churches", label: t("navChurches"), icon: <MapPin size={16} />, show: true },
        { href: "/contact", label: t("navContact"), icon: <HandHeart size={16} />, show: true },
      ],
    },
    {
      label: language === 'en' ? "Media" : "ሚዲያ",
      key: "media",
      items: [
        { href: "/live", label: language === 'en' ? "🔴 Live Stream" : "🔴 ቀጥታ ስርጭት", icon: <Radio size={16} className="text-rose-500 animate-pulse" />, show: true },
        { href: "/quiz", label: language === 'en' ? "Bible Quiz" : "የመጽሐፍ ቅዱስ ጥያቄዎች", icon: <HelpCircle size={16} className="text-gold-500" />, show: true },
        { href: "/badges", label: language === 'en' ? "Youth Badges" : "የወጣቶች ባጆች", icon: <Award size={16} className="text-amber-500" />, show: true },
        { href: "/devotional", label: language === 'en' ? "Daily Devotional" : "የእለት ቃል", icon: <BookOpen size={16} />, show: true },
        { href: "/sermons", label: t("navSermons"), icon: <BookOpen size={16} />, show: true },
        { href: "/events", label: t("navEvents"), icon: <Calendar size={16} />, show: true },
        { href: "/gallery", label: t("navGallery"), icon: <Heart size={16} />, show: true },
      ],
    },
    {
      label: language === 'en' ? "Community Care" : "የማህበረሰብ እንክብካቤ",
      key: "community",
      items: [
        { href: "/card", label: language === 'en' ? "Digital Member ID" : "ዲጂታል መታወቂያ", icon: <CreditCard size={16} className="text-gold-400" />, show: true },
        { href: "/prayer", label: language === 'en' ? "Prayer Wall" : "የጸሎት ግድግዳ", icon: <MessageSquareHeart size={16} />, show: true },
        { href: "/mutual-aid", label: language === 'en' ? "Mutual Aid" : "የእርስ በእርስ እርዳታ", icon: <HandHeart size={16} />, show: !!session },
        { href: "/volunteer", label: language === 'en' ? "Volunteer Engine" : "በጎ ፈቃደኝነት", icon: <Users size={16} />, show: !!session },
        { href: "/mentorship", label: language === 'en' ? "Mentorship" : "የአማካሪነት አገልግሎት", icon: <Briefcase size={16} />, show: !!session && isApproved },
        { href: "/counseling", label: language === 'en' ? "Counseling" : "ምክር", icon: <Heart size={16} />, show: !!session && isApproved },
        { href: "/benevolence", label: language === 'en' ? "Benevolence Fund" : "የበጎ አድራጎት ፈንድ", icon: <Heart size={16} />, show: !!session },
      ],
    }
  ];

  const handleDropdownEnter = (key: string) => {
    setActiveDropdown(key);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white font-black text-xl shadow-lg shadow-gold-500/20"
              >
                Y
              </motion.div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:text-gold-500 transition-colors duration-300">
                  {t("logoText")}
                </span>
                <span className={`text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase ${language === 'am' ? 'lang-am' : ''}`}>
                  {t("logoSub")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Centered */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-2 lg:gap-6">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${pathname === '/' ? 'text-gold-500' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {t("navHome")}
            </Link>

            {navGroups.map((group) => {
              const hasVisibleItems = group.items.some(i => i.show);
              if (!hasVisibleItems) return null;

              const isGroupActive = group.items.some(i => pathname === i.href);

              return (
                <div 
                  key={group.key}
                  className="relative group h-20 flex items-center"
                  onMouseEnter={() => handleDropdownEnter(group.key)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-900 ${isGroupActive ? 'text-gold-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {group.label}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === group.key ? 'rotate-180 text-gold-500' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === group.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-[70px] left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                      >
                        {group.items.filter(i => i.show).map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
                              pathname === item.href 
                                ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold" 
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${pathname === item.href ? 'bg-gold-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              {item.icon}
                            </div>
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <Search size={14} className="text-gold-500" />
              <span>{language === "en" ? "Search..." : "ፈልግ..."}</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-400 font-mono">
                Ctrl K
              </kbd>
            </button>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800">
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />
            </div>

            {session ? (
              <div 
                className="relative flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 h-8"
                onMouseEnter={() => handleDropdownEnter("user")}
                onMouseLeave={handleDropdownLeave}
              >
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePhoto} alt={user.name} className="w-10 h-10 rounded-full border-2 border-gold-500 object-cover shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white flex items-center justify-center font-bold shadow-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[40px] right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {isApproved && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <Users size={16} className="text-slate-400" /> {t("navDashboard")}
                        </Link>
                      )}

                      {(role === "super_admin" || role === "moderator" || role === "church_leader") && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gold-600 dark:text-gold-400 hover:bg-gold-500/10">
                          <Shield size={16} /> {t("navAdmin")}
                        </Link>
                      )}
                      
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                      
                      <button 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <LogOut size={16} /> {t("btnLogout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 h-8">
                <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors">
                  {t("btnLogin")}
                </Link>
                <Link href="/register" className="px-5 py-2 text-sm font-bold text-slate-900 bg-gold-500 hover:bg-gold-400 rounded-full shadow-lg shadow-gold-500/30 transition-all hover:-translate-y-0.5">
                  {t("btnRegister")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-slate-950 overflow-hidden shadow-2xl"
          >
            <div className="px-4 pt-4 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-2 justify-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              
              <Link href="/" onClick={() => setIsMobileOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900">
                {t("navHome")}
              </Link>

              {navGroups.map((group) => {
                const visibleItems = group.items.filter(i => i.show);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.key} className="space-y-1">
                    <p className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">{group.label}</p>
                    {visibleItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                          pathname === item.href ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </div>
                );
              })}

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                {session ? (
                  <div className="space-y-2">
                    {isApproved && (
                      <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 text-center">
                        {t("navDashboard")}
                      </Link>
                    )}
                    {(role === "super_admin" || role === "moderator" || role === "church_leader") && (
                      <Link href="/admin" onClick={() => setIsMobileOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 text-center">
                        {t("navAdmin")}
                      </Link>
                    )}
                    <button onClick={() => { setIsMobileOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full px-4 py-3 rounded-xl font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10">
                      {t("btnLogout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/login" onClick={() => setIsMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
                      {t("btnLogin")}
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileOpen(false)} className="w-full text-center px-4 py-3 rounded-xl font-bold text-slate-900 bg-gold-500">
                      {t("btnRegister")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </nav>
  );
};
export default Navbar;
