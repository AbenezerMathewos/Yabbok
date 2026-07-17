"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X, Heart, Shield, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const user = session?.user as any;
  const isApproved = user?.status === "active";
  const role = user?.role;

  const links = [
    { href: "/", label: t("navHome"), show: true },
    { href: "/about", label: t("navAbout"), show: true },
    { href: "/churches", label: t("navChurches"), show: true },
    { href: "/sermons", label: t("navSermons"), show: true },
    { href: "/events", label: t("navEvents"), show: true },
    { href: "/gallery", label: t("navGallery"), show: true },
    { href: "/contact", label: t("navContact"), show: true },
    { href: "/dashboard", label: t("navDashboard"), show: !!session && isApproved },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-500 text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                Y
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-gold-600 to-amber-500 bg-clip-text text-transparent group-hover:text-gold-500 transition-colors">
                  {t("logoText")}
                </span>
                <span className={`text-[10px] text-slate-500 dark:text-slate-400 -mt-1 ${language === 'am' ? 'lang-am' : ''}`}>
                  {t("logoSub")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {links
              .filter((l) => l.show)
              .map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                    } ${language === 'am' ? 'lang-am' : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}

            {/* Admin link */}
            {session && (role === "super_admin" || role === "moderator" || role === "church_leader") && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gold-500/30 bg-gold-500/5 text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white transition-all ${
                  pathname === "/admin" ? "bg-gold-500 text-white font-semibold" : ""
                } ${language === 'am' ? 'lang-am' : ''}`}
              >
                <Shield size={14} />
                <span>{t("navAdmin")}</span>
              </Link>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {session ? (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 hover:text-gold-500 transition-colors"
                >
                  {user.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-gold-500 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 dark:text-slate-400 transition-all"
                  title={t("btnLogout")}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Link
                  href="/login"
                  className={`px-3.5 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors ${language === 'am' ? 'lang-am' : ''}`}
                >
                  {t("btnLogin")}
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-1.5 text-sm font-semibold text-white bg-gold-500 hover:bg-gold-600 rounded-lg shadow-sm hover:shadow transition-all ${language === 'am' ? 'lang-am' : ''}`}
                >
                  {t("btnRegister")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/60 bg-white dark:bg-slate-950 px-4 pt-2 pb-4 space-y-1 shadow-inner">
          {links
            .filter((l) => l.show)
            .map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${
                    isActive
                      ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  } ${language === 'am' ? 'lang-am' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}

          {session && (role === "super_admin" || role === "moderator" || role === "church_leader") && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium border border-gold-500/20 bg-gold-500/5 text-gold-600 dark:text-gold-400 ${
                pathname === "/admin" ? "bg-gold-500 text-white" : ""
              } ${language === 'am' ? 'lang-am' : ''}`}
            >
              <Shield size={16} />
              <span>{t("navAdmin")}</span>
            </Link>
          )}

          {session ? (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
              >
                {user.profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-gold-500 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-sm">{user.name}</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 font-semibold text-sm transition-all"
              >
                <LogOut size={14} />
                <span>{t("btnLogout")}</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className={`w-full text-center px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-semibold transition-all ${language === 'am' ? 'lang-am' : ''}`}
              >
                {t("btnLogin")}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className={`w-full text-center px-4 py-2 rounded-lg text-white bg-gold-500 hover:bg-gold-600 font-semibold shadow transition-all ${language === 'am' ? 'lang-am' : ''}`}
              >
                {t("btnRegister")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
