"use client";

import React, { useState } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { QrCode, CheckCircle2, AlertTriangle, Search, UserCheck, Calendar, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminQRScanner() {
  const { language } = useLanguage();
  const [ticketInput, setTicketInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const res = await fetch("/api/events/verify-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: ticketInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (data.alreadyCheckedIn) {
          toast.warning(language === "en" ? "Member was already checked in!" : "አባሉ ቀድሞ ተመዝግቧል!");
        } else {
          toast.success(language === "en" ? "Attendee successfully checked in!" : "ተሳታፊው በተሳካ ሁኔታ ተመዝግቧል!");
        }
      } else {
        toast.error(data.error || (language === "en" ? "Invalid ticket code" : "ትክክለኛ ያልሆነ ቲኬት"));
      }
    } catch (e) {
      toast.error(language === "en" ? "An error occurred" : "ስህተት ተከስቷል");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
          <QrCode size={28} />
        </div>
        <h2 className="text-xl font-extrabold">
          {language === "en" ? "Leader Ticket Verification & Scanner" : "የመሪዎች ቲኬት ማረጋገጫ እና ስካነር"}
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {language === "en"
            ? "Enter or scan member digital ticket pass code (e.g. YSF-A1B2C3) for conference check-in."
            : "የአባሉን ዲጂታል ቲኬት ኮድ (ለምሳሌ፡ YSF-A1B2C3) በማስገባት ያስግቡ።"}
        </p>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="pt-2 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="e.g. YSF-A1B2C3"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-gold-400 placeholder:text-slate-600 focus:outline-none focus:border-gold-500 uppercase tracking-widest"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-3 bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            {language === "en" ? "Verify" : "አረጋግጥ"}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              result.alreadyCheckedIn
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
            }`}>
              <CheckCircle2 size={16} />
              {result.alreadyCheckedIn
                ? language === "en" ? "Already Checked-In" : "ቀድሞ ተመዝግቧል"
                : language === "en" ? "CHECK-IN CONFIRMED!" : "ምዝገባው ተረጋገጠ!"}
            </span>

            <span className="text-xs font-mono font-bold text-gold-500 tracking-widest">
              {result.rsvp?.ticketCode}
            </span>
          </div>

          {/* Attendee Details */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-gold-500 text-slate-950 font-extrabold flex items-center justify-center text-lg shadow">
              {result.rsvp?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                {result.rsvp?.user?.name}
              </h4>
              <p className="text-xs text-slate-500">
                📞 {result.rsvp?.user?.phone} • 🏛️ {result.rsvp?.user?.churchBranch || "YSF"}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === "en" ? "Event Title" : "የዝግጅቱ ርዕስ"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{result.rsvp?.event?.title}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{language === "en" ? "Attendance Stats" : "የተሳታፊዎች ስታቲስቲክስ"}</span>
              <span className="font-bold text-emerald-500 block">
                {result.stats?.totalCheckedIn} / {result.stats?.totalRsvps} {language === "en" ? "Present" : "ተገኝተዋል"}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
