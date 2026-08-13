"use client";

import React from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { ShieldAlert, Star, Target, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <>
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {language === "en" ? "About YABBOK" : "ስለ ያቦቅ ህብረት"}
            </h1>
            <p className="text-sm font-semibold text-gold-500 mt-2">
              Youths Strong Fellowship (YSF) of Kale Hiywet Church
            </p>
            <div className="h-1 w-12 bg-gold-500 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Intro Card */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm leading-relaxed mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {language === "en" ? "What is YABBOK?" : "ያቦቅ ምንድን ነው?"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {language === "en" 
                ? "YABBOK is a national digital fellowship network designed for the youth ministries of the Ethiopian Kale Hiywet Church (KHC). Named after the biblical river Yabbok—where Jacob wrestled with God and received a new name and blessing—the platform symbolizes a place of spiritual transformation, deep prayer, and covenant fellowship."
                : "ያቦቅ በኢትዮጵያ ቃለ ህይወት ቤተክርስቲያን የወጣቶች አገልግሎት የተዘጋጀ አገር አቀፍ የዲጂታል ህብረት መረብ ነው። ያዕቆብ ከእግዚአብሔር ጋር ታግሎ አዲስ ስምና በረከት የተቀበለበትን የመጽሐፍ ቅዱስ ወንዝ ያቦቅን በመሰየም፤ ይህ መድረክ የመንፈሳዊ መለወጥ፣ የጥልቅ ጸሎት እና የቃል ኪዳን ህብረት ምልክት ነው።"}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {language === "en" 
                ? "Rather than acting as a single church homepage, YABBOK integrates youth branches from Hawassa, Jimma, Adama, Addis Ababa, Mekelle, Bahir Dar, and many other cities into a single online family where members share resources, encourage one another, and build active prayer chains."
                : "ይህ መድረክ የአንድ አጥቢያ ቤተክርስቲያን ድረ-ገጽ ብቻ ሳይሆን፤ በሐዋሳ፣ በጅማ፣ በአዳማ፣ በአዲስ አበባ፣ በመቀሌ፣ በባህር ዳር እና በሌሎችም ከተሞች የሚገኙ የወጣቶች ቅርንጫፎችን በአንድ ላይ በማስተሳሰር ሀብቶችን የሚጋሩበት፣ የሚደጋገፉበትና የጸሎት ሰንሰለት የሚገነቡበት ነው።"}
            </p>
          </div>

          {/* History Section */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm leading-relaxed mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {language === "en" ? "Our Fellowship History" : "የህብረቱ ታሪክ"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {language === "en"
                ? "The Youths Strong Fellowship (YSF) was established to address the unique challenges faced by Christian youth in modern times. Over the years, joint annual conferences and regional prayer retreats brought together thousands of youth. To sustain this connection beyond physical events, the YSF leadership initiated the YABBOK platform as a digital space for daily spiritual growth, bible discussions, and networking."
                : "የወጣቶች ጠንካራ ህብረት (YSF) የተመሰረተው በዘመናዊው አለም ውስጥ ክርስቲያን ወጣቶች የሚጋፈጡትን ተግዳሮቶች ለመቋቋም ነው። ባለፉት አመታት የተካሄዱት አመታዊ ጉባኤዎች እና የጸሎት ሱባኤዎች በሺዎች የሚቆጠሩ ወጣቶችን አገናኝተዋል። ይህንን ግንኙነት ከአካላዊ መርሃ ግብሮች ባለፈ ለማስቀጠል፣ የህብረቱ አመራሮች ለዕለታዊ መንፈሳዊ እድገት፣ ለመጽሐፍ ቅዱስ ውይይት እና ለትስስር የሚሆን ያቦቅ ዲጂታል መድረክን ጀምረዋል።"}
            </p>
          </div>

          {/* Objectives, Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-gold-500">
                <Target size={24} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {language === "en" ? "Strategic Objectives" : "ስልታዊ ግቦች"}
                </h3>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li>{language === "en" ? "Strengthen unity across regional church fellowships." : "በክልል አብያተ ክርስቲያናት ህብረቶች መካከል አንድነትን ማጠናከር።"}</li>
                <li>{language === "en" ? "Provide theological resources and healthy discussions." : "ክርስቲያናዊ ትምህርቶችን እና ጤናማ ውይይቶችን ማቅረብ።"}</li>
                <li>{language === "en" ? "Enable direct leadership communication & announcements." : "ቀጥተኛ የአመራር መረጃዎችንና ማስታወቂያዎችን ማድረስ።"}</li>
                <li>{language === "en" ? "Provide counseling, prayer support, and mentorship." : "የምክር አገልግሎት፣ የጸሎት ድጋፍ እና ስልጠና መስጠት።"}</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-gold-500">
                <BookOpen size={24} />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {language === "en" ? "Statement of Faith" : "የእምነት መግለጫ"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === "en"
                  ? "We believe in the Trinity, the deity of Jesus Christ, His salvation work on the cross, the authority of the Holy Bible as the inspired word of God, and the active work of the Holy Spirit inside the Church body."
                  : "በስላሴ ህልውና፣ በኢየሱስ ክርስቶስ አምላክነት፣ በመስቀል ላይ ባከናወነው የደህንነት ስራ፣ በመንፈስ ቅዱስ አነሳሽነት በተጻፈው የመጽሐፍ ቅዱስ ስልጣን እና በቤተክርስቲያን ውስጥ ባለው የመንፈስ ቅዱስ ንቁ አሰራር እናምናለን።"}
              </p>
            </div>
          </div>

          {/* Leadership Structure */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-gold-500 justify-center">
              <Users size={28} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === "en" ? "YSF Fellowship Leadership" : "የወጣቶች ህብረት አመራር"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: "Pastor Abraham G/Mariam", title: language === "en" ? "Fellowship Spiritual Director" : "የህብረቱ መንፈሳዊ ዳይሬክተር", church: "Addis Ababa KHC (HQ)" },
                { name: "Deacon Samuel Girma", title: language === "en" ? "National Youth Coordinator" : "ብሔራዊ የወጣቶች አስተባባሪ", church: "Hawassa Yeheyz KHC" },
                { name: "Sister Selamawit Kassa", title: language === "en" ? "Media & Communications Head" : "የሚዲያና ኮሙኒኬሽን ኃላፊ", church: "Adama Geda KHC" },
                { name: "Evangelist Dawit Yohannes", title: language === "en" ? "Worship & Outreach Coordinator" : "የአምልኮና ወንጌል አገልግሎት አስተባባሪ", church: "Jimma KHC" },
              ].map((leader, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{leader.name}</h4>
                    <p className="text-xs text-gold-600 dark:text-gold-400 font-medium mt-1">{leader.title}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-3 block">📍 {leader.church}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
