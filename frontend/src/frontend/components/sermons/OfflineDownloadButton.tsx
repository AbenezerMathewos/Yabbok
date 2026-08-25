"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { useOfflineAudio } from "@/frontend/hooks/useOfflineAudio";
import { Download, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OfflineDownloadButtonProps {
  audioUrl?: string;
  title?: string;
}

export function OfflineDownloadButton({ audioUrl, title }: OfflineDownloadButtonProps) {
  const { language } = useLanguage();
  const { isCached, isDownloading, downloadAudio, removeAudio } = useOfflineAudio(audioUrl);

  if (!audioUrl) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(
      language === "en"
        ? `Downloading "${title || "Sermon"}" for offline listening...`
        : `"${title || "ስብከት"}" ከኢንተርኔት ውጭ ለማዳመጥ እየወረደ ነው...`
    );
    await downloadAudio();
    toast.success(
      language === "en"
        ? "Saved offline! You can listen anytime without mobile data."
        : "ከመስመር ውጭ ተቀምጧል! ያለ ዳታ ማዳመጥ ይችላሉ።"
    );
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await removeAudio();
    toast.info(
      language === "en"
        ? "Removed from offline downloads."
        : "ከመስመር ውጭ ውርዶች ተሰርዟል።"
    );
  };

  if (isDownloading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-bold animate-pulse cursor-wait"
      >
        <Loader2 size={14} className="animate-spin" />
        <span>{language === "en" ? "Downloading..." : "እየወረደ ነው..."}</span>
      </button>
    );
  }

  if (isCached) {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <CheckCircle2 size={14} />
          <span>{language === "en" ? "Saved Offline" : "ከመስመር ውጭ ተቀምጧል"}</span>
        </span>
        <button
          onClick={handleRemove}
          title={language === "en" ? "Remove offline copy" : "ከመስመር ውጭ ውርድ ሰርዝ"}
          className="p-1.5 rounded-full hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-sm group"
    >
      <Download size={14} className="text-gold-400 group-hover:translate-y-0.5 transition-transform" />
      <span>{language === "en" ? "Download Offline" : "ለከመስመር ውጭ አውርድ"}</span>
    </button>
  );
}
