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
      date: "June 02, 2026",
      desc: language === "en" 
        ? "Approved members can now register for the upcoming National Youth Conference in Addis Ababa." 
        : "የተረጋገጡ አባላት በአዲስ አበባ ለሚካሄደው ብሔራዊ የወጣቶች ኮንፈረንስ አሁን መመዝገብ ይችላሉ።",
      badge: "Urgent",
    },
    {
      title: language === "en" ? "Weekly Global Fasting & Prayer Night" : "ሳምንታዊ አጠቃላይ የጾምና ጸሎት ሌሊት",
      date: "May 30, 2026",
      desc: language === "en" 
        ? "Join us every Friday night online as we pray for the youth ministry revival across all KHC branches." 
        : "በሁሉም የቃለ ህይወት ቅርንጫፎች ላሉ የወጣቶች አገልግሎት መነቃቃት በየሳምንቱ አርብ ምሽት በኦንላይን አብረን እንጸልይ።",
      badge: "Regular",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-900 text-white py-24 sm:py-32">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1500&q=80')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-gold-950/40"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-400 border border-gold-500/30 mb-6 animate-pulse">
              📍 {language === 'en' ? 'Kale Hiywet Church Youth Fellowship' : 'የቃለ ህይወት ቤተክርስቲያን ወጣቶች ህብረት'}
            </span>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-gold-400 via-amber-200 to-white bg-clip-text text-transparent">
                {t("heroTitle")}
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-light text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t("heroSubtitle")} — {t("heroMission")}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 text-base font-semibold text-slate-950 bg-gold-400 hover:bg-gold-500 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-gold-500/20"
                >
                  {t("navDashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-3.5 text-base font-semibold text-slate-950 bg-gold-400 hover:bg-gold-500 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-gold-500/20"
                  >
                    {t("btnJoin")}
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3.5 text-base font-semibold text-white border border-slate-700 hover:border-slate-500 hover:bg-white/5 rounded-xl transition-all duration-300"
                  >
                    {t("btnLogin")}
                  </Link>
                </>
              )}
              <Link
                href="/about"
                className="px-8 py-3.5 text-base font-semibold text-slate-300 hover:text-white transition-colors"
              >
                {t("btnLearnMore")} <span className="inline-block transition-transform hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* BIBLE VERSE OF THE DAY */}
        <section className="bg-gold-50 dark:bg-gold-950/20 py-8 border-y border-gold-200/50 dark:border-gold-800/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-gold-600 dark:text-gold-400">
              📖 {t("verseOfDay")}
            </span>
            <blockquote className="mt-3 text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
              &ldquo;{t("verseText")}&rdquo;
            </blockquote>
            <cite className="block mt-2 text-xs font-semibold text-gold-700 dark:text-gold-500">
              — {t("verseRef")}
            </cite>
          </div>
        </section>

        {/* ABOUT & VISION */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                  {t("secAboutTitle")}
                </h2>
                <div className="h-1 w-12 bg-gold-500 rounded-full mb-6"></div>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {t("secAboutText")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle size={16} className="text-gold-500" />
                      {t("secVisionTitle")}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {t("secVisionText")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle size={16} className="text-gold-500" />
                      {t("secMissionTitle")}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {t("secMissionText")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 opacity-25 blur transition duration-1000 group-hover:opacity-40"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80"
                  alt="Fellowship Gathering"
                  className="relative rounded-2xl shadow-xl object-cover w-full h-[400px] transform hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {t("secValuesTitle")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-12">
              {language === 'en' ? 'The foundational pillars of the YSF community' : 'የወጣቶች ጠንካራ ህብረት አገልግሎት መሠረቶች'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Heart className="text-gold-500" size={32} />, title: t("valFaith"), desc: language === 'en' ? "Growing rooted in the word of God and prayer." : "በእግዚአብሔር ቃልና በጸሎት ሥር ሰዶ ማደግ።" },
                { icon: <Users className="text-gold-500" size={32} />, title: t("valUnity"), desc: language === 'en' ? "Fostering love and mutual support among church branches." : "በቅርንጫፍ አብያተ ክርስቲያናት መካከል ፍቅርንና ድጋፍን ማጠናከር።" },
                { icon: <BookOpen className="text-gold-500" size={32} />, title: t("valGrowth"), desc: language === 'en' ? "Nurturing spiritual wisdom and life maturity." : "መንፈሳዊ ጥበብንና የሕይወት ብስለትን ማሳደግ።" },
                { icon: <Layers className="text-gold-500" size={32} />, title: t("valService"), desc: language === 'en' ? "Serving local churches and surrounding communities." : "አጥቢያ አብያተ ክርስቲያናትንና የአካባቢውን ማህበረሰብ ማገልገል።" },
              ].map((value, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST ANNOUNCEMENTS */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 text-center">
              {t("dashAnnouncements")}
            </h2>
            <div className="h-1 w-12 bg-gold-500 rounded-full mb-10 mx-auto"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mockedAnnouncements.map((ann, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                  <span className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-white ${
                    ann.badge === "Urgent" ? "bg-rose-500" : "bg-gold-500"
                  }`}>
                    {ann.badge}
                  </span>
                  <p className="text-xs text-slate-400 mb-2">{ann.date}</p>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-gold-500 transition-colors">
                    {ann.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {ann.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UPCOMING EVENTS & SERMONS PREVIEW */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Events Column */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t("navEvents")}
                  </h2>
                  <Link href="/events" className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1">
                    {language === 'en' ? 'View All' : 'ሁሉንም አሳይ'} <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {events.length > 0 ? (
                    events.map((event: any) => (
                      <div key={event._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gold-100 dark:bg-gold-950/40 text-gold-700 dark:text-gold-400 rounded-xl w-14 h-14 border border-gold-500/20">
                          <span className="text-lg font-extrabold leading-none">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                            {new Date(event.date).toLocaleString(language, { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-500">
                            {event.category}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {event.location}
                            </span>
                            {event.isLive && (
                              <span className="flex items-center gap-1 text-emerald-500 font-bold uppercase">
                                🔴 Live ({event.livePlatform})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">{t("dashNoEvents")}</p>
                  )}
                </div>
              </div>

              {/* Sermons Column */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t("navSermons")}
                  </h2>
                  <Link href="/sermons" className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1">
                    {language === 'en' ? 'View All' : 'ሁሉንም አሳይ'} <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="space-y-4">
                  {sermons.length > 0 ? (
                    sermons.map((sermon: any) => (
                      <div key={sermon._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex gap-4 items-center">
                        <div className="flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl w-12 h-12 text-slate-500 dark:text-slate-400">
                          <Volume2 size={24} />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                            {sermon.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-gold-400 font-medium mt-1">
                            {sermon.speaker}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(sermon.date).toLocaleDateString(language, { dateStyle: "medium" })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic">No sermons uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="py-16 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1500&q=80')" }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">
              {t("statsTitle")}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { icon: <Users size={28} className="text-gold-400 mx-auto mb-2" />, count: stats.totalUsers, label: t("statMembers") },
                { icon: <MapPin size={28} className="text-gold-400 mx-auto mb-2" />, count: stats.totalChurches, label: t("statChurches") },
                { icon: <Calendar size={28} className="text-gold-400 mx-auto mb-2" />, count: stats.totalEvents, label: t("statEvents") },
                { icon: <Heart size={28} className="text-gold-400 mx-auto mb-2" />, count: stats.totalPrayers, label: t("statPrayers") },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  {stat.icon}
                  <span className="text-3xl sm:text-4xl font-extrabold text-gold-400 tracking-tight">
                    {stat.count}+
                  </span>
                  <span className={`text-xs text-slate-400 mt-1 font-semibold ${language === 'am' ? 'lang-am' : ''}`}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTICIPATING CHURCHES PREVIEW */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {t("navChurches")}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'en' ? 'Local churches currently participating in the YSF network' : 'በወጣቶች ጠንካራ ህብረት አውታረ መረብ ውስጥ የሚሳተፉ አጥቢያዎች'}
                </p>
              </div>
              <Link href="/churches" className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1">
                {language === 'en' ? 'View All' : 'ሁሉንም አሳይ'} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {churches.length > 0 ? (
                churches.map((church: any) => (
                  <div key={church._id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-gold-100 dark:bg-gold-950/55 text-gold-700 dark:text-gold-400">
                        📍 {church.city}, {church.region}
                      </span>
                      <h3 className="font-bold text-lg text-slate-950 dark:text-white mt-3">
                        {church.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {church.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center text-xs">
                      <span className="text-slate-400">
                        {language === 'en' ? 'Members:' : 'አባላት፦'} <strong className="text-slate-700 dark:text-slate-200">{church.memberCount}</strong>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No churches found.</p>
              )}
            </div>
          </div>
        </section>

        {/* GALLERY PREVIEW & CALL TO ACTION */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {language === 'en' ? 'Captured Fellowship Moments' : 'የህብረት ትዝታዎች'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 text-xs">
              {language === 'en' ? 'Photos and videos from our conferences, prayer programs, and service ministries.' : 'ከኮንፈረንሶች፣ ከጸሎት ፕሮግራሞችና ከአገልግሎቶች የተቀረጹ ምስሎች።'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
              {[
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80",
              ].map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden shadow-sm group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Gallery Moment"
                    className="object-cover w-full h-full transform group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors"></div>
                </div>
              ))}
            </div>

            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gold-500/40 text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-slate-950 text-sm font-semibold transition-all shadow-sm"
            >
              <ImageIcon size={16} />
              <span>{language === 'en' ? 'View Photo Gallery' : 'ወደ ማዕከለ-ስዕላት ሂድ'}</span>
            </Link>
          </div>
        </section>

        {/* JOIN THE FELLOWSHIP BANNER */}
        {!session && (
          <section className="bg-gradient-to-r from-gold-500 to-amber-500 py-16 text-slate-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                {language === 'en' ? 'Ready to Join the Community?' : 'ህብረቱን ለመቀላቀል ዝግጁ ነዎት?'}
              </h2>
              <p className="text-base sm:text-lg text-slate-900 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                {language === 'en' 
                  ? 'Sign up today to share your testimonies, write prayer requests, participate in live meeting chats, and connect with other Kale Hiywet Church youth!' 
                  : 'የእግዚአብሔርን ስራ ለመመስከር፣ በጸሎት ለመደጋገፍ፣ በኦንላይን ስብሰባዎች ላይ ለመሳተፍና ከሌሎች አጥቢያ ወጣቶች ጋር ለመገናኘት ዛሬውኑ ይመዝገቡ!'}
              </p>
              <Link
                href="/register"
                className="px-8 py-3.5 bg-slate-950 text-white font-bold hover:bg-slate-900 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                {t("btnRegister")}
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
