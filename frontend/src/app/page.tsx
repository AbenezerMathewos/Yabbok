"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  Volume2, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  Image as ImageIcon 
} from "lucide-react";
import { motion } from "framer-motion";
import { TextRepel } from "@/components/ui/text-repel";
import { Magnetic } from "@/components/ui/magnetic";
import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { BackgroundGeometric } from "@/components/ui/background-geometric";

export default function HomePage() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();

  const [churches, setChurches] = useState([]);
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 140,
    totalChurches: 5,
    totalEvents: 18,
    totalPrayers: 64,
  });

  useEffect(() => {
    // Fetch data for public previews
    fetch("/api/churches")
      .then((res) => res.json())
      .then((data) => setChurches(data.slice(0, 3)))
      .catch((err) => console.error(err));

    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.slice(0, 2)))
      .catch((err) => console.error(err));

    fetch("/api/sermons")
      .then((res) => res.json())
      .then((data) => setSermons(data.slice(0, 2)))
      .catch((err) => console.error(err));

    fetch("/api/admin/stats")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => setStats(data))
      .catch(() => {}); // Fallback to defaults
  }, []);

  const mockedAnnouncements = [
    {
      title: language === "en" ? "Registration Open for National Conference" : "ለብሔራዊ ኮንፈረንስ ምዝገባ ተጀምሯል",
      date: language === "en" ? "June 02, 2026" : "ሰኔ 02, 2026",
      desc: language === "en" 
        ? "Approved members can now register for the upcoming National Youth Conference in Addis Ababa." 
        : "የተረጋገጡ አባላት በአዲስ አበባ ለሚካሄደው ብሔራዊ የወጣቶች ኮንፈረንስ አሁን መመዝገብ ይችላሉ።",
      badge: language === "en" ? "Urgent" : "አስቸኳይ",
    },
    {
      title: language === "en" ? "Weekly Global Fasting & Prayer Night" : "ሳምንታዊ አጠቃላይ የጾምና ጸሎት ሌሊት",
      date: language === "en" ? "May 30, 2026" : "ግንቦት 30, 2026",
      desc: language === "en" 
        ? "Join us every Friday night online as we pray for the youth ministry revival across all KHC branches." 
        : "በሁሉም የቃለ ህይወት ቅርንጫፎች ላሉ የወጣቶች አገልግሎት መነቃቃት በየሳምንቱ አርብ ምሽት በኦንላይን አብረን እንጸልይ።",
      badge: language === "en" ? "Regular" : "መደበኛ",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
          {/* Background image & gradient overlay */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1500&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-gold-950/40"></div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gold-500/20 text-gold-400 border border-gold-500/30 mb-8 backdrop-blur-sm"
            >
              📍 {language === 'en' ? 'Kale Hiywet Church Youth Fellowship' : 'የቃለ ህይወት ቤተክርስቲያን ወጣቶች ህብረት'}
            </motion.span>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight z-20 relative drop-shadow-2xl">
              <TextRepel 
                text={t("heroTitle")} 
                className="inline-flex flex-wrap justify-center"
                letterClassName="text-gold-400 hover:text-white transition-colors duration-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                radius={200}
                strength={75}
                stiffness={250}
                damping={12}
              />
            </h1>
            <div className="text-lg sm:text-xl font-light text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed z-20 relative">
              <TextRepel 
                text={language === 'en' 
                  ? "yabbok fellowship    Youths Strong Fellowship Platform — Connecting youth across Kale Hiywet Churches in Ethiopia to grow spiritually, support one another in prayer, and share resources." 
                  : "ያቦቅ ህብረት    የወጣቶች ጠንካራ ህብረት መድረክ — የኢትዮጵያ ቃለ ህይወት አብያተ ክርስቲያናት ወጣቶችን በማገናኘት በመንፈሳዊ ለማደግ፣ በጸሎት ለመደጋገፍ እና ሃብት ለመለዋወጥ።"}
                className="inline-flex justify-center"
                radius={80}
                strength={25}
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {session ? (
                <Magnetic strength={0.2}>
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-gold-500/30 flex items-center justify-center"
                    data-interactive
                  >
                    {t("navDashboard")}
                  </Link>
                </Magnetic>
              ) : (
                <>
                  <Magnetic strength={0.2}>
                    <Link
                      href="/register"
                      className="px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-gold-500/30 flex items-center justify-center"
                      data-interactive
                    >
                      {t("btnJoin")}
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.1}>
                    <Link
                      href="/login"
                      className="px-8 py-4 text-base font-bold text-white border-2 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
                      data-interactive
                    >
                      {t("btnLogin")}
                    </Link>
                  </Magnetic>
                </>
              )}
              <Link
                href="/about"
                className="px-8 py-4 text-base font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
              >
                {t("btnLearnMore")} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="py-8 border-y border-slate-200/50 dark:border-slate-800/50">
          <InfiniteMarquee items={language === 'en' 
            ? ["Spiritual Growth", "Community", "Faith", "Fellowship", "Prayer", "Youth Leadership", "Service"]
            : ["መንፈሳዊ ዕድገት", "ማህበረሰብ", "እምነት", "ህብረት", "ጸሎት", "የወጣቶች አመራር", "አገልግሎት"]} />
        </div>

        {/* BIBLE VERSE OF THE DAY */}
        <section className="bg-transparent py-10 border-y border-gold-200/50 dark:border-gold-800/20">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto px-4 text-center"
          >
            <span className="text-xs uppercase tracking-widest font-black text-gold-600 dark:text-gold-500 bg-gold-100 dark:bg-gold-900/30 px-3 py-1 rounded-full">
              📖 {t("verseOfDay")}
            </span>
            <blockquote className="mt-6 text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
              &ldquo;{t("verseText")}&rdquo;
            </blockquote>
            <cite className="block mt-4 text-sm font-bold text-gold-700 dark:text-gold-500">
              — {t("verseRef")}
            </cite>
          </motion.div>
        </section>

        {/* ABOUT & VISION */}
        <section className="py-24 bg-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">
                  {t("secAboutTitle")}
                </h2>
                <div className="h-1.5 w-16 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full mb-8"></div>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                  {t("secAboutText")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3 text-lg mb-3">
                      <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-lg text-gold-600 dark:text-gold-400">
                        <CheckCircle size={20} />
                      </div>
                      {t("secVisionTitle")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {t("secVisionText")}
                    </p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3 text-lg mb-3">
                      <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-lg text-gold-600 dark:text-gold-400">
                        <CheckCircle size={20} />
                      </div>
                      {t("secMissionTitle")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {t("secMissionText")}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group"
              >
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-gold-500 to-amber-500 opacity-20 blur-xl transition duration-1000 group-hover:opacity-40"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80"
                  alt="Fellowship Gathering"
                  className="relative rounded-3xl shadow-2xl object-cover w-full h-[500px] transform hover:scale-[1.02] transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-24 bg-white/20 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-4"
            >
              {t("secValuesTitle")}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-16 font-medium"
            >
              {language === 'en' ? 'The foundational pillars of the YSF community' : 'የወጣቶች ጠንካራ ህብረት አገልግሎት መሠረቶች'}
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Heart size={32} />, title: t("valFaith"), desc: language === 'en' ? "Growing rooted in the word of God and prayer." : "በእግዚአብሔር ቃልና በጸሎት ሥር ሰዶ ማደግ።" },
                { icon: <Users size={32} />, title: t("valUnity"), desc: language === 'en' ? "Fostering love and mutual support among church branches." : "በቅርንጫፍ አብያተ ክርስቲያናት መካከል ፍቅርንና ድጋፍን ማጠናከር።" },
                { icon: <BookOpen size={32} />, title: t("valGrowth"), desc: language === 'en' ? "Nurturing spiritual wisdom and life maturity." : "መንፈሳዊ ጥበብንና የሕይወት ብስለትን ማሳደግ።" },
                { icon: <Layers size={32} />, title: t("valService"), desc: language === 'en' ? "Serving local churches and surrounding communities." : "አጥቢያ አብያተ ክርስቲያናትንና የአካባቢውን ማህበረሰብ ማገልገል።" },
              ].map((value, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-lg shadow-slate-200/20 dark:shadow-none transition-all duration-300"
                >
                  <div className="w-16 h-16 mx-auto bg-gold-50 dark:bg-gold-900/20 text-gold-500 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST ANNOUNCEMENTS */}
        <section className="py-24 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-6 text-center"
            >
              {t("dashAnnouncements")}
            </motion.h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-gold-500 to-amber-500 rounded-full mb-12 mx-auto"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {mockedAnnouncements.map((ann, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all"
                >
                  <span className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-black uppercase tracking-wider text-white ${
                    ann.badge === "Urgent" || ann.badge === "አስቸኳይ" ? "bg-rose-500" : "bg-gold-500"
                  }`}>
                    {ann.badge}
                  </span>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{ann.date}</p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-gold-500 transition-colors">
                    {ann.title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {ann.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS & SERMONS PREVIEW */}
        <section className="py-24 bg-white/20 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Events Column */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    {t("navEvents")}
                  </h2>
                  <Link href="/events" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 flex items-center gap-1 bg-gold-50 dark:bg-gold-900/20 px-4 py-2 rounded-full transition-colors">
                    {language === 'en' ? 'View All' : 'ሁሉንም አሳይ'} <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="space-y-6">
                  {events.length > 0 ? (
                    events.map((event: any, i) => (
                      <motion.div 
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-gold-500/50 shadow-lg hover:shadow-[0_0_30px_-5px_rgba(250,204,21,0.3)] transition-all duration-500 hover:-translate-y-2 flex gap-6 overflow-hidden"
                      >
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                        
                        <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 text-gold-400 rounded-2xl w-20 h-20 border border-slate-700 group-hover:border-gold-500/40 transition-colors shadow-inner">
                          <span className="text-3xl font-black leading-none drop-shadow-md group-hover:text-gold-300 transition-colors">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400 group-hover:text-gold-200 transition-colors">
                            {new Date(event.date).toLocaleString(language, { month: "short" })}
                          </span>
                        </div>
                        <div className="relative z-10">
                          <span className="text-[10px] uppercase font-black tracking-widest text-gold-500 bg-gold-500/10 px-2 py-1 rounded-full">
                            {event.category === 'Youth Meeting' && language === 'am' ? 'የወጣቶች ስብሰባ' : 
                             event.category === 'Conference' && language === 'am' ? 'ኮንፈረንስ' :
                             event.category === 'Prayer Night' && language === 'am' ? 'የጸሎት ሌሊት' :
                             event.category === 'Retreat' && language === 'am' ? 'የዕረፍት ጊዜ' :
                             event.category === 'Bible Study' && language === 'am' ? 'የመጽሐፍ ቅዱስ ጥናት' :
                             event.category}
                          </span>
                          <h3 className="font-bold text-lg text-white mt-3 mb-2 group-hover:text-gold-100 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1.5 group-hover:text-slate-300 transition-colors">
                              <MapPin size={14} className="text-gold-500/70" /> {event.location}
                            </span>
                            {event.isLive && (
                              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-900/30 border border-emerald-500/20 px-2 py-1 rounded-md uppercase tracking-wider text-[10px] shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {language === 'en' ? 'Live' : 'ቀጥታ'} ({event.livePlatform})
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic bg-white dark:bg-slate-900 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">{language === 'en' ? 'No events uploaded yet.' : 'ምንም ዝግጅቶች አልተሰቀሉም።'}</p>
                  )}
                </div>
              </motion.div>

              {/* Sermons Column */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    {t("navSermons")}
                  </h2>
                  <Link href="/sermons" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 flex items-center gap-1 bg-gold-50 dark:bg-gold-900/20 px-4 py-2 rounded-full transition-colors">
                    {language === 'en' ? 'View All' : 'ሁሉንም አሳይ'} <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="space-y-6">
                  {sermons.length > 0 ? (
                    sermons.map((sermon: any, i) => (
                      <motion.div 
                        key={sermon._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group p-5 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-gold-500/40 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(250,204,21,0.2)] transition-all duration-500 hover:-translate-y-2 flex gap-5 items-center cursor-pointer relative overflow-hidden"
                      >
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center bg-slate-800 rounded-2xl w-14 h-14 text-slate-400 group-hover:text-gold-400 group-hover:bg-slate-800/80 group-hover:border group-hover:border-gold-500/30 transition-all duration-300 shadow-inner">
                          <Volume2 size={24} className="group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="relative z-10 flex-grow">
                          <h3 className="font-bold text-base text-white leading-tight mb-1 group-hover:text-gold-100 transition-colors">
                            {sermon.title}
                          </h3>
                          <p className="text-sm text-gold-500 font-bold mb-0.5">
                            {sermon.speaker}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
                            {new Date(sermon.date).toLocaleDateString(language, { dateStyle: "medium" })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic bg-white dark:bg-slate-900 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">{language === 'en' ? 'No sermons uploaded yet.' : 'ምንም ስብከቶች አልተሰቀሉም።'}</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="py-24 bg-transparent text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1500&q=80')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-black text-center mb-16"
            >
              {t("statsTitle")}
            </motion.h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {[
                { icon: <Users size={36} className="text-gold-400 mx-auto mb-4" />, count: stats.totalUsers, label: t("statMembers") },
                { icon: <MapPin size={36} className="text-gold-400 mx-auto mb-4" />, count: stats.totalChurches, label: t("statChurches") },
                { icon: <Calendar size={36} className="text-gold-400 mx-auto mb-4" />, count: stats.totalEvents, label: t("statEvents") },
                { icon: <Heart size={36} className="text-gold-400 mx-auto mb-4" />, count: stats.totalPrayers, label: t("statPrayers") },
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="flex flex-col"
                >
                  <div className="bg-slate-800/50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-slate-700">
                    {stat.icon}
                  </div>
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {stat.count}+
                  </span>
                  <span className={`text-sm text-gold-400 mt-2 font-bold uppercase tracking-widest ${language === 'am' ? 'lang-am' : ''}`}>
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTICIPATING CHURCHES PREVIEW */}
        <section className="py-24 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                  {t("navChurches")}
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {language === 'en' ? 'Local churches currently participating in the YSF network' : 'በወጣቶች ጠንካራ ህብረት አውታረ መረብ ውስጥ የሚሳተፉ አጥቢያዎች'}
                </p>
              </div>
              <Link href="/churches" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 flex items-center gap-1 bg-gold-50 dark:bg-gold-900/20 px-5 py-2.5 rounded-full transition-colors hidden sm:flex">
                {language === 'en' ? 'View All Directory' : 'ሁሉንም አሳይ'} <ArrowRight size={16} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {churches.length > 0 ? (
                churches.map((church: any, i) => (
                  <motion.div 
                    key={church._id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="h-full"
                  >
                    <div className="group relative p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-gold-500/50 shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(250,204,21,0.2)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-full w-full rounded-3xl overflow-hidden cursor-pointer">
                      {/* Decorative glowing orb behind text */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 text-gold-400 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                          {church.city}, {church.region}
                        </span>
                        <h3 className="font-black text-2xl text-white mt-5 mb-3 group-hover:text-gold-50 transition-colors">
                          {church.name}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-300 transition-colors">
                          {church.description}
                        </p>
                      </div>
                      <div className="relative z-10 mt-8 pt-6 border-t border-slate-700/50 group-hover:border-gold-500/20 flex justify-between items-center text-sm font-bold transition-colors">
                        <span className="text-slate-500 flex items-center gap-2 uppercase tracking-wider text-[10px]">
                          {language === 'en' ? 'Total Members' : 'አጠቃላይ አባላት'}
                        </span>
                        <span className="px-3 py-1 bg-slate-800 rounded-md text-gold-400 font-black border border-slate-700 group-hover:border-gold-500/30 transition-colors">
                          {church.memberCount}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">{language === 'en' ? 'No churches found.' : 'ምንም አብያተ ክርስቲያናት አልተገኙም።'}</p>
              )}
            </div>
            
            <div className="mt-8 flex justify-center sm:hidden">
              <Link href="/churches" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500 flex items-center gap-1 bg-gold-50 dark:bg-gold-900/20 px-5 py-2.5 rounded-full transition-colors">
                {language === 'en' ? 'View All Directory' : 'ሁሉንም አሳይ'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* GALLERY PREVIEW & CALL TO ACTION */}
        <section className="py-24 bg-white/20 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-4"
            >
              {language === 'en' ? 'Captured Fellowship Moments' : 'የህብረት ትዝታዎች'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-12 text-sm font-medium"
            >
              {language === 'en' ? 'Photos and videos from our conferences, prayer programs, and service ministries.' : 'ከኮንፈረንሶች፣ ከጸሎት ፕሮግራሞችና ከአገልግሎቶች የተቀረጹ ምስሎች።'}
            </motion.p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
              {[
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80",
              ].map((url, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-sm group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Gallery Moment"
                    className="object-cover w-full h-full transform group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors duration-500"></div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-gold-500/40 text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:border-gold-500 hover:text-white font-bold transition-all shadow-sm"
              >
                <ImageIcon size={20} />
                <span>{language === 'en' ? 'Explore Full Gallery' : 'ወደ ማዕከለ-ስዕላት ሂድ'}</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* JOIN THE FELLOWSHIP BANNER */}
        {!session && (
          <section className="bg-gradient-to-r from-gold-400/20 via-gold-500/20 to-amber-500/20 py-24 text-slate-100 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-black mb-6"
              >
                {language === 'en' ? 'Ready to Join the Community?' : 'ህብረቱን ለመቀላቀል ዝግጁ ነዎት?'}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl text-slate-900/80 mb-10 font-bold leading-relaxed"
              >
                {language === 'en' 
                  ? 'Sign up today to share your testimonies, request pastoral counseling, participate in volunteer networks, and connect with other Kale Hiywet Church youth!' 
                  : 'የእግዚአብሔርን ስራ ለመመስከር፣ በጸሎት ለመደጋገፍ፣ በኦንላይን ስብሰባዎች ላይ ለመሳተፍና ከሌሎች አጥቢያ ወጣቶች ጋር ለመገናኘት ዛሬውኑ ይመዝገቡ!'}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="/register"
                  className="px-10 py-5 bg-slate-950 text-white font-black rounded-2xl shadow-2xl transition-all transform hover:scale-105 hover:bg-slate-900 inline-block text-lg"
                >
                  {t("btnRegister")}
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
