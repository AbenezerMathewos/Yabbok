"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "am" : "en")}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all shadow-sm"
      aria-label="Switch Language"
    >
      <span className="text-base">🌐</span>
      <span>{language === "en" ? "አማርኛ" : "English"}</span>
    </button>
  );
};
export default LanguageSwitcher;
