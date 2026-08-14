"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { X, QrCode, CheckCircle, Ticket, Calendar, MapPin } from "lucide-react";

interface QRCodePassModalProps {
  isOpen: boolean;
  event: any;
  ticketCode: string;
  userName: string;
  onClose: () => void;
}

export function QRCodePassModal({
  isOpen,
  event,
  ticketCode,
  userName,
  onClose,
}: QRCodePassModalProps) {
  const { language } = useLanguage();
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Top bar accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="pt-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gold-500/10 text-gold-500 mb-3">
            <Ticket size={28} />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            {language === 'en' ? 'Digital Event Ticket Pass' : 'የዲጂታል ዝግጅት መግቢያ ቲኬት'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            YSF Official Youth Fellowship Pass
          </p>
        </div>

        {/* QR Code representation */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 inline-block shadow-inner">
          <QrCode size={140} className="text-gold-400 mx-auto animate-pulse" />
          <span className="block text-[11px] font-mono font-bold text-gold-300 mt-3 tracking-widest uppercase">
            {ticketCode}
          </span>
        </div>

        {/* Details */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl text-left space-y-2 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {event.title}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar size={12} className="text-gold-500" />
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <MapPin size={12} className="text-gold-500" />
            {event.location}
          </p>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-semibold">{language === 'en' ? 'Attendee:' : 'ተሳታፊ፡'}</span>
            <span className="font-bold text-gold-500">{userName}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          {language === 'en' ? 'Done & Save Pass' : 'ተጠናቋል ቲኬቱን አስቀምጥ'}
        </button>
      </div>
    </div>
  );
}
