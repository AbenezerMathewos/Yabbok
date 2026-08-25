"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { useAudio } from "@/frontend/context/AudioContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { OfflineDownloadButton } from "@/frontend/components/sermons/OfflineDownloadButton";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Loader2, Music, Video, FileText, ChevronDown, ChevronUp, BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const },
});

export default function SermonsPage() {
  const { t, language } = useLanguage();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sermons")
      .then((res) => res.json())
      .then((data) => { setSermons(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
                <BookOpen size={14} />
                {language === "en" ? "Word & Teaching" : "ቃልና ትምህርት"}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{t("navSermons")}</h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                {language === "en"
                  ? "Audio teachings, video sermons, and study notes from YSF leaders."
                  : "ከወጣቶች መሪዎች የድምጽ ትምህርቶች፣ ቪዲዮ ስብከቶች፣ እና ማስታወሻዎች።"}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-32">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-muted-foreground text-sm font-medium">{language === "en" ? "Loading sermons…" : "ስብከቶች እየተጫኑ ነው…"}</p>
            </div>
          ) : sermons.length === 0 ? (
            <div className="text-center py-24 bg-card border border-border/60 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <BookOpen size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {language === "en" ? "No sermons yet" : "ስብከቶች ገና አልተጫኑም"}
              </h3>
              <p className="text-muted-foreground font-medium">
                {language === "en" ? "Check back soon — more are coming!" : "ብዙ ቦ ሲቀር ይምጡ!"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sermons.map((sermon: any, i: number) => {
                const isVideoPlaying = activeVideoId === sermon._id;
                const isNotesExpanded = expandedNotesId === sermon._id;
                return (
                  <motion.div key={sermon._id} {...fadeUp(i)}
                    className="bg-card border border-border/60 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                  >
                    {/* Card body */}
                    <div className="p-7">
                      <div className="flex flex-col md:flex-row gap-5 md:items-start justify-between">
                        {/* Left */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className="text-primary border-primary/30 font-bold text-[10px] uppercase tracking-wider">
                              {sermon.category || "General"}
                            </Badge>
                            <span className="text-muted-foreground text-xs flex items-center gap-1 font-medium">
                              <Calendar size={12} />
                              {new Date(sermon.date).toLocaleDateString(language === "en" ? "en-US" : "am-ET", { dateStyle: "medium" })}
                            </span>
                          </div>
                          <h3 className="font-black text-xl text-foreground leading-tight mb-2">{sermon.title}</h3>
                          <p className="text-primary text-sm font-bold mb-3">🎤 {sermon.speaker}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed font-medium">{sermon.description}</p>
                        </div>

                        {/* Right actions */}
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                          {sermon.audioUrl && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  playTrack({ title: sermon.title, speaker: sermon.speaker, audioUrl: sermon.audioUrl });
                                  setActiveVideoId(null);
                                }}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                  currentTrack?.audioUrl === sermon.audioUrl && isPlaying
                                    ? "bg-gold-500 text-slate-950 animate-pulse"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow gold-glow"
                                }`}
                              >
                                <Play size={14} fill="currentColor" />
                                {currentTrack?.audioUrl === sermon.audioUrl && isPlaying
                                  ? (language === "en" ? "Now Playing..." : "እየተጫወተ ነው...")
                                  : (language === "en" ? "Play Audio" : "ድምጽ አጫውት")}
                              </button>
                              <OfflineDownloadButton audioUrl={sermon.audioUrl} title={sermon.title} />
                            </div>
                          )}
                          {sermon.videoUrl && (
                            <button
                              onClick={() => { setActiveVideoId(isVideoPlaying ? null : sermon._id); }}
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                isVideoPlaying
                                  ? "bg-muted text-foreground border-border"
                                  : "bg-card text-foreground border-border hover:border-primary/50 hover:text-primary"
                              }`}
                            >
                              <Video size={14} />
                              {isVideoPlaying ? (language === "en" ? "Close" : "ዝጋ") : (language === "en" ? "Watch Video" : "ቪዲዮ እይ")}
                            </button>
                          )}
                          {sermon.notes && (
                            <button
                              onClick={() => setExpandedNotesId(isNotesExpanded ? null : sermon._id)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all border border-border"
                            >
                              <FileText size={14} />
                              {language === "en" ? "Notes" : "ማስታወሻ"}
                              {isNotesExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video player */}
                    <AnimatePresence>
                      {isVideoPlaying && sermon.videoUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border/50"
                        >
                          <div className="aspect-video bg-black">
                            <video src={sermon.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Study notes */}
                    <AnimatePresence>
                      {isNotesExpanded && sermon.notes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border/50"
                        >
                          <div className="p-7 bg-muted/30">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                              {language === "en" ? "Study Notes" : "የጥናት ማስታወሻ"}
                            </p>
                            <p className="text-sm text-foreground leading-loose whitespace-pre-wrap font-medium">{sermon.notes}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
