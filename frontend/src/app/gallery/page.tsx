"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

const CATEGORIES = [
  { id: "all",        label: "All Photos",     labelAm: "ሁሉም ፎቶዎች",             emoji: "🖼️" },
  { id: "worship",    label: "Worship",        labelAm: "አምልኮ",                  emoji: "🙏" },
  { id: "conference", label: "Conferences",    labelAm: "ኮንፈረንስ",                emoji: "🎤" },
  { id: "education",  label: "Education",      labelAm: "ትምህርት",                 emoji: "📚" },
  { id: "outreach",   label: "Outreach",       labelAm: "የማህበረሰብ አገልግሎት",      emoji: "🌍" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function GalleryPage() {
  const { language } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery?category=${activeCategory}`)
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  const openLightbox = (i: number) => { setLightboxIndex(i); document.body.style.overflow = "hidden"; };
  const closeLightbox = () => { setLightboxIndex(null); document.body.style.overflow = ""; };
  const prevImage = () => setLightboxIndex((i) => (i !== null ? (i - 1 + items.length) % items.length : null));
  const nextImage = () => setLightboxIndex((i) => (i !== null ? (i + 1) % items.length : null));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950/85 backdrop-blur-2xl">

        {/* ── Hero ── */}
        <section className="relative py-24 bg-slate-900 overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-gold-950/20" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10 max-w-3xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Camera size={14} />
                {language === "en" ? "Visual Stories" : "የምስል ታሪኮች"}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                {language === "en" ? "Fellowship Gallery" : "የህብረት ፎቶ ቤተ-ስዕል"}
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
                {language === "en"
                  ? "Moments of worship, learning, and community captured across our fellowship."
                  : "በአምልኮ፣ ትምህርት እና ኅብረት የተቀረጹ ቅጽበቶቻችን።"}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg gold-glow scale-105"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{language === "en" ? cat.label : cat.labelAm}</span>
              </button>
            ))}
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-muted-foreground text-sm font-medium">{language === "en" ? "Loading photos…" : "ፎቶዎች እየተጫኑ ነው…"}</p>
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-32"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                <Camera size={36} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">
                {language === "en" ? "No photos yet" : "አሁን ፎቶ የለም"}
              </h3>
              <p className="text-muted-foreground font-medium">
                {language === "en" ? "Check back soon — memories are being made!" : "ቆይ ይምጣ — ትዝታዎች እየተሰሩ ናቸው!"}
              </p>
            </motion.div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  onClick={() => openLightbox(i)}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-white font-bold text-sm leading-tight">{item.title}</span>
                    {item.description && (
                      <span className="text-white/70 text-xs mt-0.5 line-clamp-2">{item.description}</span>
                    )}
                    <span className="mt-2 px-2.5 py-1 rounded-full bg-primary/80 text-primary-foreground text-[10px] font-bold w-fit capitalize">
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Lightbox ── */}
        <AnimatePresence>
          {lightboxIndex !== null && items[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/96 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              {/* Controls */}
              <button onClick={closeLightbox}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10">
                <X size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10">
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10">
                <ChevronRight size={24} />
              </button>

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="max-w-5xl w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={items[lightboxIndex].imageUrl}
                  alt={items[lightboxIndex].title}
                  className="max-h-[72vh] w-auto rounded-2xl shadow-2xl object-contain"
                />
                <div className="mt-5 text-center">
                  <h3 className="text-white font-black text-xl">{items[lightboxIndex].title}</h3>
                  {items[lightboxIndex].description && (
                    <p className="text-white/60 text-sm mt-1.5 max-w-xl">{items[lightboxIndex].description}</p>
                  )}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold capitalize border border-primary/30">
                      {items[lightboxIndex].category}
                    </span>
                    <span className="text-white/30 text-xs">{lightboxIndex + 1} / {items.length}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </>
  );
}
