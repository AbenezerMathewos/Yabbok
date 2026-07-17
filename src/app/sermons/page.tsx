"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { Play, Square, Loader2, Music, Video, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function SermonsPage() {
  const { t, language } = useLanguage();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Player state
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sermons")
      .then((res) => res.json())
      .then((data) => {
        setSermons(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleNotes = (id: string) => {
    setExpandedNotesId(expandedNotesId === id ? null : id);
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              {t("navSermons")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {language === 'en' 
                ? 'Listen to audio teachings, watch video sermons, and read study notes from YSF leaders.'
                : 'የድምፅ ትምህርቶችን ያዳምጡ፣ የስብከት ቪዲዮዎችን ይመልከቱ እንዲሁም ከወጣቶች መሪዎች የተዘጋጁ ማስታወሻዎችን ያንብቡ።'}
            </p>
            <div className="h-1 w-12 bg-gold-500 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Audio Bar Status (Sticky Player at bottom if active) */}
          {activeAudioUrl && (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white py-4 px-6 border-t border-gold-500/40 flex items-center justify-between shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Music className="text-gold-400 animate-bounce" size={20} />
                <span className="text-xs font-semibold text-slate-200">
                  {language === 'en' ? 'Now Playing Fellowship Audio Stream...' : 'የህብረት ትምህርት ድምጽ በመጫወት ላይ...'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <audio src={activeAudioUrl} autoPlay controls className="h-8 max-w-xs sm:max-w-sm rounded" />
                <button
                  onClick={() => setActiveAudioUrl(null)}
                  className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                  title="Close player"
                >
                  <Square size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gold-500" size={36} />
            </div>
          ) : sermons.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {sermons.map((sermon: any) => {
                const isNotesExpanded = expandedNotesId === sermon._id;
                const isVideoPlaying = activeVideoUrl === sermon._id;

                return (
                  <div key={sermon._id} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                      
                      {/* Left Info */}
                      <div>
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                          {sermon.category || "General"}
                        </span>
                        <h3 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white mt-3 leading-snug">
                          {sermon.title}
                        </h3>
                        <p className="text-sm text-gold-600 dark:text-gold-400 font-bold mt-1">
                          🎤 {sermon.speaker}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          📅 {new Date(sermon.date).toLocaleDateString(language, { dateStyle: "medium" })}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-3xl">
                          {sermon.description}
                        </p>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-wrap md:flex-col gap-2 shrink-0 justify-start md:justify-center md:items-end mt-2">
                        {sermon.audioUrl && (
                          <button
                            onClick={() => {
                              setActiveAudioUrl(sermon.audioUrl);
                              setActiveVideoUrl(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>{language === 'en' ? 'Play Audio' : 'ድምጽ አጫውት'}</span>
                          </button>
                        )}
                        {sermon.videoUrl && (
                          <button
                            onClick={() => {
                              setActiveVideoUrl(isVideoPlaying ? null : sermon._id);
                              setActiveAudioUrl(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 hover:text-gold-500 text-white text-xs font-semibold rounded-xl transition-all border border-slate-700/60"
                          >
                            <Video size={12} />
                            <span>{isVideoPlaying ? (language === 'en' ? 'Close Video' : 'ቪዲዮ ዝጋ') : (language === 'en' ? 'Watch Video' : 'ቪዲዮ እይ')}</span>
                          </button>
                        )}
                        <button
                          onClick={() => toggleNotes(sermon._id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gold-500/10 hover:text-gold-600 text-xs font-semibold rounded-xl transition-all"
                        >
                          <FileText size={12} />
                          <span>{language === 'en' ? 'Sermon Notes' : 'የስብከት ማስታወሻ'}</span>
                          {isNotesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Video stream */}
                    {isVideoPlaying && sermon.videoUrl && (
                      <div className="mt-6 rounded-2xl overflow-hidden aspect-video border border-slate-700/50 bg-black">
                        <video src={sermon.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* Collapsible Study Notes */}
                    {isNotesExpanded && sermon.notes && (
                      <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap shadow-inner">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-gold-500">
                          {language === 'en' ? 'Study Summary / References' : 'የጥናት ማጠቃለያ እና ጥቅሶች'}
                        </h4>
                        {sermon.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
              <p className="text-slate-500 dark:text-slate-400">No sermons found.</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
