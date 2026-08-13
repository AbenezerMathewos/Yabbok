"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { fetchChurches } from "@/frontend/lib/api/churchesApi";
import { ChurchDto } from "@/frontend/types/churches";
import { MapPin, Users, Search, Loader2 } from "lucide-react";

export default function ChurchesPage() {
  const { t, language } = useLanguage();
  const [churches, setChurches] = useState<ChurchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    fetchChurches()
      .then((data) => {
        setChurches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Unable to load church branches.");
        setLoading(false);
      });
  }, []);

  const filteredChurches = churches.filter((church) => {
    const matchesSearch = 
      church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = 
      selectedRegion === "all" || 
      church.region.toLowerCase() === selectedRegion.toLowerCase();

    return matchesSearch && matchesRegion;
  });

  // Extract unique regions for filtering
  const regions = ["all", ...new Set(churches.map((church) => church.region))];

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              {t("navChurches")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {language === 'en' 
                ? 'Local Kale Hiywet Church youth branches participating in the YABBOK network.'
                : 'በያቦቅ ኔትወርክ ውስጥ የሚሳተፉ የቃለ ህይወት አብያተ ክርስቲያናት የወጣቶች ቅርንጫፎች።'}
            </p>
            <div className="h-1 w-12 bg-gold-500 rounded-full mx-auto mt-4"></div>
          </div>

          {/* Search & Filters */}
          <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search by name or city...' : 'በስም ወይም በከተማ ፈልግ...'}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:border-gold-500 text-sm"
              />
            </div>

            {/* Region Filters */}
            <div className="flex gap-2 flex-wrap w-full md:w-auto justify-end">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedRegion === reg
                      ? "bg-gold-500 text-slate-950 font-bold"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-gold-500"
                  }`}
                >
                  {reg === "all" ? (language === 'en' ? 'All Regions' : 'ሁሉም ክልሎች') : reg}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gold-500" size={36} />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
              <p className="text-rose-500 font-semibold text-sm">{error}</p>
            </div>
          ) : filteredChurches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredChurches.map((church) => (
                <div key={church._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-gold-100 dark:bg-gold-950/50 text-gold-700 dark:text-gold-400">
                      📍 {church.city}, {church.region}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-950 dark:text-white mt-4 group-hover:text-gold-500 transition-colors">
                      {church.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {church.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/50 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gold-500" />
                      {language === 'en' ? 'Youth Members:' : 'የወጣት አባላት፦'} <strong>{church.memberCount}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      YSF Partner
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
              <p className="text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'No church branches match your search.' : 'ለፍለጋዎ የሚሆን አጥቢያ አልተገኘም።'}
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
