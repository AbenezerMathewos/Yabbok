"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { language } = useLanguage();

  if (!password) return null;

  const calculateScore = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const score = calculateScore(password);

  const getStrengthInfo = (score: number) => {
    switch (score) {
      case 1:
        return { labelEn: "Weak", labelAm: "ደካማ", color: "bg-rose-500", width: "w-1/4" };
      case 2:
        return { labelEn: "Fair", labelAm: "መካከለኛ", color: "bg-amber-500", width: "w-2/4" };
      case 3:
      case 4:
        return { labelEn: "Strong", labelAm: "ጠንካራ", color: "bg-emerald-500", width: "w-3/4" };
      case 5:
        return { labelEn: "Excellent", labelAm: "በጣም ጠንካራ", color: "bg-gold-500", width: "w-full" };
      default:
        return { labelEn: "Too short", labelAm: "በጣም አጭር", color: "bg-slate-300 dark:bg-slate-700", width: "w-1/12" };
    }
  };

  const info = getStrengthInfo(score);

  return (
    <div className="space-y-1.5 mt-2">
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${info.color} ${info.width}`} />
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-slate-400">
          {language === "en" ? "Password Strength:" : "የይለፍ ቃል ጥንካሬ፡"}
        </span>
        <span className="text-slate-700 dark:text-slate-200">
          {language === "en" ? info.labelEn : info.labelAm}
        </span>
      </div>
    </div>
  );
}
