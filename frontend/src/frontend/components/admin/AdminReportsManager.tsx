"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Download, Users, CalendarCheck, HeartHandshake, MessageSquareHeart, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export function AdminReportsManager() {
  const { language } = useLanguage();

  const handleExport = (type: string) => {
    toast.info(language === "en" ? "Generating CSV export..." : "የCSV ሪፖርት እየተዘጋጀ ነው...");
    window.open(`/api/admin/export?type=${type}`, "_blank");
  };

  const exportCards = [
    {
      type: "members",
      titleEn: "Youth Members Directory",
      titleAm: "የወጣቶች አባላት ማውጫ",
      descEn: "Export full member profiles, phone numbers, regions, and church branches.",
      descAm: "የአባላቱን ሙሉ መረጃ፣ ስልክ፣ ክልል እና የቤተክርስቲያን ህብረት ያውርዱ።",
      icon: <Users className="text-blue-500" size={24} />,
    },
    {
      type: "attendance",
      titleEn: "Event Attendance & QR Tickets",
      titleAm: "የዝግጅቶች ተሳትፎ እና QR ቲኬቶች",
      descEn: "Export event RSVPs, unique ticket codes (YSF-XXXXXX), and check-in statuses.",
      descAm: "የኮንፈረንስ እና የዝግጅቶች ተሳታፊዎች እና የቲኬት ማረጋገጫዎች ሪፖርት።",
      icon: <CalendarCheck className="text-emerald-500" size={24} />,
    },
    {
      type: "benevolence",
      titleEn: "Benevolence Fund Requests",
      titleAm: "የበጎ አድራጎት ፈንድ ጥያቄዎች",
      descEn: "Export emergency financial assistance requests, requested amounts, and status.",
      descAm: "የአደጋ ጊዜ የእርዳታ ጥያቄዎች እና የፈንድ ማጽደቂያ ሪፖርት።",
      icon: <HeartHandshake className="text-purple-500" size={24} />,
    },
    {
      type: "counseling",
      titleEn: "Pastoral Counseling Triage",
      titleAm: "የእረኝነት ምክር ጥያቄዎች",
      descEn: "Export confidential counseling requests, urgency levels, and pastor response status.",
      descAm: "የምክር አገልግሎት ጥያቄዎች እና የእረኞች ምላሽ ሁኔታ ሪፖርት።",
      icon: <MessageSquareHeart className="text-amber-500" size={24} />,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileSpreadsheet size={14} />
            {language === "en" ? "Leader Reports Suite" : "የመሪዎች ሪፖርት ማውጫ"}
          </div>
          <h2 className="text-2xl font-extrabold">
            {language === "en" ? "CSV Data Exports & PDF Reports" : "የCSV እና PDF ሪፖርት ማውረጫ"}
          </h2>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportCards.map((card) => (
          <div
            key={card.type}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
                {card.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {language === "en" ? card.titleEn : card.titleAm}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {language === "en" ? card.descEn : card.descAm}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleExport(card.type)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow"
            >
              <Download size={16} />
              {language === "en" ? `Export ${card.titleEn} (CSV)` : `ሪፖርት አውርድ (CSV)`}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
