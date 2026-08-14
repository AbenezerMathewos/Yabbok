"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { fetchChurches } from "@/frontend/lib/api/churchesApi";
import { ChurchDto } from "@/frontend/types/churches";
import { motion } from "framer-motion";
import { MapPin, Users, Search, Loader2, Church } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" as const },
});

export default function ChurchesPage() {
  const { t, language } = useLanguage();
  const [churches, setChurches] = useState<ChurchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    fetchChurches()
      .then((data) => { setChurches(data); setLoading(false); })
      .catch((err) => { setError(err instanceof Error ? err.message : "Unable to load churches."); setLoading(false); });
  }, []);

  const filteredChurches = churches.filter((church) => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === "all" || church.region.toLowerCase() === selectedRegion.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  const regions = ["all", ...new Set(churches.map((c) => c.region))];

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
                <Church size={14} />
                {language === "en" ? "Partner Network" : "የሽርክና ኔትወርክ"}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{t("navChurches")}</h1>
              <p className="text-slate-400 text-lg font-medium">
                {language === "en"
                  ? "Local Kale Hiywet Church youth branches participating in the YABBOK network."
                  : "በያቦቅ ኔትወርክ ውስጥ የሚሳተፉ የቃለ ህይወት ቤተ ክርስቲያናት።"}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-border/60 rounded-2xl p-5 mb-10 flex flex-col md:flex-row gap-4 items-center shadow-sm"
          >
            <div className="relative w-full md:max-w-md">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "en" ? "Search by name or city…" : "በስም ወይም ከተማ ፈልግ…"}
                className="pl-11 h-11 rounded-xl border-border"
              />
            </div>
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRegion === reg
                      ? "bg-primary text-primary-foreground shadow-sm gold-glow"
                      : "bg-muted text-muted-foreground border border-border hover:border-primary/50"
                  }`}
                >
                  {reg === "all" ? (language === "en" ? "All Regions" : "ሁሉም ክልሎች") : reg}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          {!loading && !error && (
            <p className="text-sm text-muted-foreground font-medium mb-6">
              {filteredChurches.length} {language === "en" ? "branches found" : "ቅርንጫፎች ተገኝተዋል"}
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={36} />
              <p className="text-muted-foreground text-sm font-medium">{language === "en" ? "Loading churches…" : "ቤተ ክርስቲያናት እየተጫኑ ነው…"}</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 bg-card border border-border/60 rounded-2xl">
              <p className="text-destructive font-semibold">{error}</p>
            </div>
          ) : filteredChurches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChurches.map((church, i) => (
                <motion.div
                  key={church._id}
                  {...fadeUp(i)}
                  className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary/40 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Church size={22} className="text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
                        YSF Partner
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold mb-2">
                      <MapPin size={12} className="text-primary shrink-0" />
                      {church.city}, {church.region}
                    </div>
                    <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                      {church.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {church.description}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Users size={15} className="text-primary" />
                      <span>{church.memberCount}</span>
                      <span className="text-muted-foreground font-medium text-xs">
                        {language === "en" ? "youth" : "ወጣቶች"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      KHC
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card border border-border/60 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
                <Church size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {language === "en" ? "No churches found" : "ቤተ ክርስቲያን አልተገኘም"}
              </h3>
              <p className="text-muted-foreground font-medium">
                {language === "en" ? "Try a different search or region." : "ሌላ ፍለጋ ወይም ክልል ይሞክሩ።"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
