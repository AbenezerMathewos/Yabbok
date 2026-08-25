"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { CreditCard, Printer, CheckCircle2, ShieldCheck, Sparkles, QrCode, MapPin, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MemberCardPage() {
  const { language } = useLanguage();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/member-card")
      .then((r) => r.json())
      .then((data) => {
        setMember(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    toast.info(language === "en" ? "Opening print dialog..." : "የማተሚያ ውይይት እየተከፈተ ነው...");
    window.print();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
              <CreditCard size={16} />
              {language === "en" ? "Official Digital Pass" : "ኦፊሴላዊ ዲጂታል አባልነት"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === "en" ? "Fellowship Membership Card" : "የህብረት አባልነት መታወቂያ"}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {language === "en"
                ? "Your verified digital pass for YABBOK youth meetings, retreats, and regional conferences."
                : "ለያቦቅ ወጣቶች ህብረት፣ ኮንፈረንስ እና ዝግጅቶች የተዘጋጀ የተረጋገጠ ዲጂታል መታወቂያ።"}
            </p>
          </div>

          {/* Card Container */}
          {loading ? (
            <Skeleton className="h-80 w-full rounded-3xl bg-slate-900" />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-gold-950/60 border-2 border-gold-500/40 shadow-2xl shadow-gold-500/10 overflow-hidden space-y-6"
            >
              {/* Background watermark icon */}
              <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-white">
                <BookOpen size={240} />
              </div>

              {/* Top Header of Card */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gold-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                    Y
                  </div>
                  <div>
                    <span className="font-black text-base text-white leading-none block">YABBOK</span>
                    <span className="text-gold-400 text-[9px] font-extrabold uppercase tracking-widest block mt-0.5">Youth Fellowship</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck size={14} />
                  <span>{language === "en" ? "VERIFIED MEMBER" : "የተረጋገጠ አባል"}</span>
                </div>
              </div>

              {/* Middle Section: Photo & Profile Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                
                {/* Profile Photo */}
                <div className="relative w-24 h-24 rounded-2xl border-2 border-gold-500/50 overflow-hidden shadow-lg shrink-0">
                  <img
                    src={member?.profilePhoto}
                    alt={member?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Member Info */}
                <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                  <h3 className="text-xl font-black text-white truncate">{member?.name}</h3>
                  <p className="text-xs font-mono text-gold-400 font-bold tracking-widest">{member?.memberId}</p>
                  
                  <div className="pt-2 text-xs text-slate-400 space-y-1">
                    <p className="flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                      <MapPin size={13} className="text-gold-500 shrink-0" />
                      <span>{member?.churchName} ({member?.churchBranch})</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      📞 {member?.phone} • 📍 {member?.region}
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom Footer of Card: QR Code & Issued Date */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                    {language === "en" ? "Issued Date" : "የተሰጠበት ቀን"}
                  </span>
                  <span className="text-xs font-bold text-slate-300 block">{member?.issuedDate}</span>
                </div>

                {/* Scannable Member QR Code */}
                <div className="p-2 rounded-xl bg-white text-slate-950 shadow-md flex items-center justify-center">
                  <QrCode size={40} />
                </div>
              </div>

            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrint}
              className="px-8 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 shadow-xl gold-glow active:scale-95"
            >
              <Printer size={16} />
              {language === "en" ? "Print / Save Member Pass" : "መታወቂያውን አትም / አስቀምጥ"}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
