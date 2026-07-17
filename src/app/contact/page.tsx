"use client";

import React, { useState } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { t, language } = useLanguage();
  
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert(language === 'en' ? "Please fill in all required fields." : "እባክዎን ሁሉንም አስፈላጊ ቦታዎችን ይሙሉ");
      return;
    }
    
    // Simulate sending contact request
    console.log("Contact form submitted:", form);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              {t("contactTitle")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
              {t("contactSubtitle")}
            </p>
            <div className="h-1 w-12 bg-gold-500 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Details Panel (1/3) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                <h3 className="font-bold text-lg text-slate-950 dark:text-white mb-4">
                  {language === 'en' ? 'Coordination Office' : 'አስተባባሪ ጽሕፈት ቤት'}
                </h3>
                
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex gap-3">
                    <MapPin size={18} className="text-gold-500 shrink-0 mt-0.5" />
                    <p>
                      {language === 'en'
                        ? 'KHC HQ building, Room 304, Addis Ababa, Ethiopia'
                        : 'የቃለ ህይወት ዋና መሥሪያ ቤት ሕንጻ፣ ቢሮ ቁጥር 304፣ አዲስ አበባ፣ ኢትዮጵያ'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Phone size={18} className="text-gold-500 shrink-0 mt-0.5" />
                    <p>+251 115 514 277</p>
                  </div>

                  <div className="flex gap-3">
                    <Mail size={18} className="text-gold-500 shrink-0 mt-0.5" />
                    <p>info@khc-ysf-yabbok.org</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                <h3 className="font-bold text-base text-slate-950 dark:text-white mb-3">
                  {language === 'en' ? 'Social Channels' : 'ማህበራዊ ገጾች'}
                </h3>
                <div className="space-y-2 text-xs">
                  <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-gold-500 transition-colors">
                    📘 Telegram: @YSF_Yabbok_Official
                  </a>
                  <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-gold-500 transition-colors">
                    📺 YouTube: Kale Hiywet Church Youth
                  </a>
                  <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-gold-500 transition-colors">
                    ✉️ Support Email: support@yabbok.org
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Panel (2/3) */}
            <div className="lg:col-span-2">
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
                      {language === 'en' ? 'Submission Successful!' : 'በተሳካ ሁኔታ ተልኳል!'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      {t("contactSuccess")}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow"
                    >
                      {language === 'en' ? 'Send another message' : 'ሌላ መልዕክት ላክ'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("formName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("formEmail")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("formSubject")}
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("formMessage")} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <Send size={14} />
                      <span>{t("btnSend")}</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
