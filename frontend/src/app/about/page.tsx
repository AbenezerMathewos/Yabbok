"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { motion } from "framer-motion";
import { ShieldAlert, Star, Target, Users, BookOpen, Flame, Globe, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const leaders = (language: string) => [
  { name: "Pastor Abraham G/Mariam",  title: language === "en" ? "Spiritual Director"        : "መንፈሳዊ ዳይሬክተር",      church: "Addis Ababa KHC (HQ)", initial: "A" },
  { name: "Deacon Samuel Girma",      title: language === "en" ? "National Youth Coordinator" : "ብሔራዊ አስተባባሪ",       church: "Hawassa Yeheyz KHC",   initial: "S" },
  { name: "Sister Selamawit Kassa",   title: language === "en" ? "Media & Communications"     : "ሚዲያ ና ኮሙኒኬሽን",     church: "Adama Geda KHC",       initial: "S" },
  { name: "Evangelist Dawit Yohannes",title: language === "en" ? "Worship & Outreach"         : "አምልኮ ና ወንጌል",       church: "Jimma KHC",            initial: "D" },
];

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">

        {/* ── Hero ── */}
        <section className="relative py-28 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-gold-950/20" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          {/* Decorative cross glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-xs font-bold uppercase tracking-widest mb-8">
                <Flame size={14} />
                Youths Strong Fellowship (YSF) · Kale Hiywet Church
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
                {language === "en" ? "About YABBOK" : "ስለ ያቦቅ ህብረት"}
              </h1>
              <div className="gold-divider mx-auto mb-6" />
              <p className="text-slate-300 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                {language === "en"
                  ? "A national digital fellowship network uniting Christian youth across Ethiopia in one covenant community."
                  : "ክርስቲያን ወጣቶችን ከመላው ኢትዮጵያ የሚያስተሳስር አገራዊ ዲጂታል የህብረት መረብ።"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── What is YABBOK ── */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeUp(0.1)}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 block">
                {language === "en" ? "Our Story" : "ታሪካችን"}
              </span>
              <h2 className="text-3xl font-black text-foreground mb-5 leading-tight">
                {language === "en" ? "What is YABBOK?" : "ያቦቅ ምንድን ነው?"}
              </h2>
              <div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
                <p>
                  {language === "en"
                    ? "YABBOK is a national digital fellowship network designed for the youth ministries of the Ethiopian Kale Hiywet Church. Named after the biblical river Yabbok—where Jacob wrestled with God and received a new name and blessing—the platform symbolizes a place of spiritual transformation, deep prayer, and covenant fellowship."
                    : "ያቦቅ በኢትዮጵያ ቃለ ህይወት ቤተክርስቲያን የወጣቶች አገልግሎት የተዘጋጀ አገር አቀፍ የዲጂታል ህብረት መረብ ነው። ያዕቆብ ከእግዚአብሔር ጋር ታግሎ አዲስ ስምና በረከት የተቀበለበትን ወንዝ ያቦቅን በመሰየም፤ ይህ መድረክ የመንፈሳዊ መለወጥ፣ የጥልቅ ጸሎት እና የቃል ኪዳን ህብረት ምልክት ነው።"}
                </p>
                <p>
                  {language === "en"
                    ? "Rather than acting as a single church homepage, YABBOK integrates youth branches from Hawassa, Jimma, Adama, Addis Ababa, Mekelle, Bahir Dar, and many other cities into a single online family where members share resources, encourage one another, and build active prayer chains."
                    : "ይህ መድረክ የአንድ አጥቢያ ድረ-ገጽ ብቻ ሳይሆን፤ በሐዋሳ፣ በጅማ፣ በአዳማ፣ በአዲስ አበባ፣ በሌሎችም ከተሞች ያሉ ቅርንጫፎችን ያስተሳስራል።"}
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe,   label: language === "en" ? "National Coverage" : "ብሔራዊ ሽፋን",    desc: language === "en" ? "Youth branches across all major Ethiopian cities" : "በዋና ዋና ከተሞች" },
                { icon: Heart,   label: language === "en" ? "Covenant Community" : "የቃል ኪዳን ህብረት",  desc: language === "en" ? "Built on mutual support and spiritual fellowship" : "ድጋፍ ና ህብረት" },
                { icon: BookOpen,label: language === "en" ? "Biblical Foundation" : "የቁጥቅጥ ምሰሶ",   desc: language === "en" ? "Rooted in scripture and theological education" : "በቁጥቅጥ የተሰረተ" },
                { icon: Flame,   label: language === "en" ? "Spirit-Led Growth" : "በመንፈስ ዕድገት",    desc: language === "en" ? "Prayer, worship and outreach at the core" : "ጸሎት ና አምልኮ" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* ── History ── */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp(0)} className="mb-10 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 block">
              {language === "en" ? "Our History" : "ታሪካችን"}
            </span>
            <h2 className="text-3xl font-black text-foreground">
              {language === "en" ? "Fellowship History" : "የህብረቱ ታሪክ"}
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.1)}
            className="bg-card border border-border/60 rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent rounded-l-3xl" />
            <p className="text-muted-foreground font-medium leading-loose text-base">
              {language === "en"
                ? "The Youths Strong Fellowship (YSF) was established to address the unique challenges faced by Christian youth in modern times. Over the years, joint annual conferences and regional prayer retreats brought together thousands of youth. To sustain this connection beyond physical events, the YSF leadership initiated the YABBOK platform as a digital space for daily spiritual growth, bible discussions, and networking."
                : "የወጣቶች ጠንካራ ህብረት (YSF) የተመሰረተው በዘመናዊው አለም ውስጥ ክርስቲያን ወጣቶች የሚጋፈጡትን ተግዳሮቶች ለመቋቋም ነው። ባለፉት አመታት አመታዊ ጉባኤዎች እና የጸሎት ሱባኤዎች ብዙ ሺ ወጣቶችን አቅፈዋል። ይህንን ግንኙነት ለማስቀጠል ያቦቅ ዲጂታል መድረክ ተጀምሯል።"}
            </p>
          </motion.div>
        </section>

        {/* ── Objectives & Faith ── */}
        <section className="py-10 max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {[
              {
                icon: Target,
                title: language === "en" ? "Strategic Objectives" : "ስልታዊ ግቦች",
                content: (
                  <ul className="space-y-3 text-sm text-muted-foreground font-medium">
                    {[
                      language === "en" ? "Strengthen unity across regional church fellowships." : "በክልል አብያተ ክርስቲያናት ህብረቶች አንድነትን ማጠናከር።",
                      language === "en" ? "Provide theological resources and healthy discussions." : "ክርስቲያናዊ ትምህርቶችን ና ጤናማ ውይይቶችን ማቅረብ።",
                      language === "en" ? "Enable direct leadership communication & announcements." : "ቀጥተኛ የአመራር መረጃዎችን ማድረስ።",
                      language === "en" ? "Provide counseling, prayer support, and mentorship." : "የምክር ና የጸሎት ድጋፍ ና ስልጠና መስጠት።",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Star size={11} className="text-primary" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                icon: BookOpen,
                title: language === "en" ? "Statement of Faith" : "የእምነት መግለጫ",
                content: (
                  <p className="text-sm text-muted-foreground font-medium leading-loose">
                    {language === "en"
                      ? "We believe in the Trinity, the deity of Jesus Christ, His salvation work on the cross, the authority of the Holy Bible as the inspired word of God, and the active work of the Holy Spirit inside the Church body."
                      : "በስላሴ ህልውና፣ በኢየሱስ ክርስቶስ አምላክነት፣ በመስቀል ላይ ባከናወነው የደህንነት ስራ፣ በመጽሐፍ ቅዱስ ስልጣን እና በቤተክርስቲያን ውስጥ ባለው የመንፈስ ቅዱስ አሰራር እናምናለን።"}
                  </p>
                ),
              },
            ].map(({ icon: Icon, title, content }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.1)}
                className="bg-card border border-border/60 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-black text-xl text-foreground">{title}</h3>
                </div>
                {content}
              </motion.div>
            ))}
          </div>

          {/* ── Leadership ── */}
          <motion.div {...fadeUp(0)} className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3 block">
              {language === "en" ? "Our Team" : "ቡድናችን"}
            </span>
            <h2 className="text-3xl font-black text-foreground">
              {language === "en" ? "YSF Fellowship Leadership" : "የወጣቶች ህብረት አመራር"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {leaders(language).map((leader, i) => (
              <motion.div key={leader.name} {...fadeUp(i * 0.08)}
                className="bg-card border border-border/60 rounded-2xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-slate-950 font-black text-lg shrink-0">
                  {leader.initial}
                </div>
                <div>
                  <h4 className="font-black text-foreground">{leader.name}</h4>
                  <p className="text-primary text-xs font-bold mt-0.5">{leader.title}</p>
                  <p className="text-muted-foreground text-xs mt-2 font-medium">📍 {leader.church}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
