"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const CATEGORIES = [
  { id: "all", label: "All Photos", labelAm: "ሁሉም ፎቶዎች", emoji: "🖼️" },
  { id: "worship", label: "Worship", labelAm: "አምልኮ", emoji: "🙏" },
  { id: "conference", label: "Conferences", labelAm: "ኮንፈረንስ", emoji: "🎤" },
  { id: "education", label: "Education", labelAm: "ትምህርት", emoji: "📚" },
  { id: "outreach", label: "Outreach", labelAm: "የማህበረሰብ አገልግሎት", emoji: "🌍" },
];

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

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
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
      <main className="flex-grow bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/30 text-white text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <span className="text-4xl mb-4 block">🖼️</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-amber-300 bg-clip-text text-transparent">
              {language === "en" ? "Fellowship Gallery" : "የህብረት ፎቶ ቤተ-ስዕል"}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
              {language === "en"
                ? "Moments of worship, learning, and community captured across our fellowship."
                : "በአምልኮ፣ ትምህርት እና ኅብረት የተቀረጹ ቅጽበቶቻችን።"}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{language === "en" ? cat.label : cat.labelAm}</span>
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-amber-500" size={36} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <span className="text-6xl block mb-4">📷</span>
              <p className="text-slate-400 text-sm">
                {language === "en"
                  ? "No photos in this category yet. Check back soon!"
                  : "አሁን ፎቶ የለም። ቆይ ይምጣ!"}
              </p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {items.map((item, i) => (
                <div
                  key={item._id}
                  onClick={() => openLightbox(i)}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <span className="text-white font-bold text-xs">{item.title}</span>
                    {item.description && (
                      <span className="text-white/70 text-[10px] mt-0.5 line-clamp-2">{item.description}</span>
                    )}
                    <span className="mt-2 px-2 py-0.5 rounded-full bg-amber-500/80 text-slate-950 text-[9px] font-bold w-fit capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && items[lightboxIndex] && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-amber-400 z-10"
              onClick={closeLightbox}
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-400 z-10 bg-white/10 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-amber-400 z-10 bg-white/10 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={28} />
            </button>
            <div
              className="max-w-4xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={items[lightboxIndex].imageUrl}
                alt={items[lightboxIndex].title}
                className="max-h-[75vh] w-auto rounded-2xl shadow-2xl object-contain"
              />
              <div className="mt-4 text-center">
                <h3 className="text-white font-bold text-lg">{items[lightboxIndex].title}</h3>
                {items[lightboxIndex].description && (
                  <p className="text-white/60 text-sm mt-1">{items[lightboxIndex].description}</p>
                )}
                <span className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold capitalize border border-amber-500/30">
                  {items[lightboxIndex].category}
                </span>
                <p className="text-white/40 text-xs mt-2">
                  {lightboxIndex + 1} / {items.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
