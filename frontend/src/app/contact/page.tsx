"use client";

import React, { useState } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Send, CheckCircle2, MessageSquare, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactInfo = [
  { icon: MapPin, label: { en: "Address", am: "አድራሻ" }, value: { en: "KHC HQ Building, Room 304, Addis Ababa, Ethiopia", am: "የቃለ ህይወት ዋና መሥሪያ ቤት ሕንጻ፣ ቢሮ 304፣ አዲስ አበባ" } },
  { icon: Phone, label: { en: "Phone", am: "ስልክ" }, value: { en: "+251 115 514 277", am: "+251 115 514 277" } },
  { icon: Mail,  label: { en: "Email", am: "ኢሜል" }, value: { en: "info@khc-ysf-yabbok.org", am: "info@khc-ysf-yabbok.org" } },
  { icon: Clock, label: { en: "Office Hours", am: "የሥራ ሰዓት" }, value: { en: "Mon–Fri, 8:00AM – 5:00PM EAT", am: "ሰኞ–ዓርብ፣ 8:00 – 5:00" } },
];

const socialLinks = [
  { emoji: "✈️", label: "Telegram", handle: "@YSF_Yabbok_Official", href: "#" },
  { emoji: "▶️", label: "YouTube",  handle: "Kale Hiywet Church Youth", href: "#" },
  { emoji: "📧", label: "Support",  handle: "support@yabbok.org", href: "#" },
];

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">

        {/* ── Hero ── */}
        <section className="relative py-24 bg-slate-900 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-gold-950/20" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
                <MessageSquare size={14} />
                {language === "en" ? "Get in Touch" : "ይገናኙን"}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{t("contactTitle")}</h1>
              <p className="text-slate-400 text-lg font-medium">{t("contactSubtitle")}</p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* ── Left: Contact info ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Info card */}
              <div className="bg-card border border-border/60 rounded-3xl p-7 space-y-6">
                <h3 className="font-black text-xl text-foreground">
                  {language === "en" ? "Coordination Office" : "አስተባባሪ ጽሕፈት ቤት"}
                </h3>
                <div className="space-y-5">
                  {contactInfo.map(({ icon: Icon, label, value }) => (
                    <div key={label.en} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                          {language === "en" ? label.en : label.am}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {language === "en" ? value.en : value.am}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="bg-card border border-border/60 rounded-3xl p-7">
                <div className="flex items-center gap-2 mb-5">
                  <Globe size={18} className="text-primary" />
                  <h3 className="font-black text-base text-foreground">
                    {language === "en" ? "Social Channels" : "ማህበራዊ ገጾች"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {socialLinks.map((s) => (
                    <a key={s.label} href={s.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-all group">
                      <span className="text-xl w-8 text-center">{s.emoji}</span>
                      <div>
                        <p className="text-xs font-black text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{s.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Right: Form ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-sm h-full">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={44} className="text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-black text-foreground mb-2">
                        {language === "en" ? "Message Sent!" : "መልዕክቱ ተልኳል!"}
                      </h3>
                      <p className="text-muted-foreground font-medium mb-8">{t("contactSuccess")}</p>
                      <Button onClick={() => setSubmitted(false)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11 px-8 rounded-xl gold-glow">
                        {language === "en" ? "Send another" : "ሌላ ላክ"}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div className="mb-6">
                        <h3 className="text-xl font-black text-foreground mb-1">
                          {language === "en" ? "Send a Message" : "መልዕክት ይላኩ"}
                        </h3>
                        <p className="text-muted-foreground text-sm font-medium">
                          {language === "en" ? "We'll get back to you within 24 hours." : "ባልሞላ 24 ሰዓት ምላሽ ይሰጣሉ።"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="c-name" className="text-sm font-semibold">{t("formName")} <span className="text-destructive">*</span></Label>
                          <Input id="c-name" type="text" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="h-12 rounded-xl" placeholder="Abebe Kebede" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="c-email" className="text-sm font-semibold">{t("formEmail")} <span className="text-destructive">*</span></Label>
                          <Input id="c-email" type="email" required value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="h-12 rounded-xl" placeholder="name@example.com" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="c-subject" className="text-sm font-semibold">{t("formSubject")}</Label>
                        <Input id="c-subject" type="text" value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className="h-12 rounded-xl"
                          placeholder={language === "en" ? "What is this about?" : "ስለ ምን ነው?"} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="c-message" className="text-sm font-semibold">{t("formMessage")} <span className="text-destructive">*</span></Label>
                        <textarea id="c-message" required rows={6} value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder={language === "en" ? "Your message here…" : "መልዕክትዎን እዚህ ያስቀምጡ…"}
                          className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                      </div>

                      <Button type="submit" disabled={loading}
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg gold-glow text-base">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            {language === "en" ? "Sending…" : "እየተላከ…"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send size={18} />
                            {t("btnSend")}
                          </span>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
