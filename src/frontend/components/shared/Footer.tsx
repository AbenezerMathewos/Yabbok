"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/frontend/context/LanguageContext";

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500 text-white font-bold text-base shadow">
                Y
              </span>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gold-600 to-amber-500 bg-clip-text text-transparent">
                {t("logoText")}
              </span>
            </div>
            <p className={`text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed ${language === 'am' ? 'lang-am' : ''}`}>
              {t("footerSlogan")}
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navHome")}
              </Link>
              <Link href="/about" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navAbout")}
              </Link>
              <Link href="/churches" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navChurches")}
              </Link>
              <Link href="/sermons" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navSermons")}
              </Link>
              <Link href="/events" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navEvents")}
              </Link>
              <Link href="/gallery" className="text-slate-500 hover:text-gold-500 dark:text-slate-400 dark:hover:text-gold-400 transition-colors">
                {t("navGallery")}
              </Link>
            </div>
          </div>

          {/* Socials & Contacts */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Social Links
            </h4>
            <div className="flex gap-4 mt-1 text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-gold-500 transition-colors" title="Facebook">
                📘 Facebook
              </a>
              <a href="#" className="hover:text-gold-500 transition-colors" title="Telegram">
                ✈️ Telegram
              </a>
              <a href="#" className="hover:text-gold-500 transition-colors" title="YouTube">
                📺 YouTube
              </a>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Email: info@khc-ysf-yabbok.org
            </p>
          </div>
        </div>

        {/* Lower section */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
          <p className={language === 'am' ? 'lang-am' : ''}>
            &copy; {currentYear} {t("logoText")} ({t("logoSub")}). {t("footerReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
