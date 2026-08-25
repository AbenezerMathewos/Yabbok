"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clock, Loader2, MapPin, Video, Calendar, AlertCircle, Ticket } from "lucide-react";
import { fetchEvents, registerForEvent, unregisterFromEvent } from "@/frontend/lib/api/eventsApi";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { EVENT_CATEGORIES, EventDto } from "@/frontend/types/events";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodePassModal } from "@/frontend/components/events/QRCodePassModal";
import { toast } from "sonner";

const CATEGORY_FILTERS = ["all", ...EVENT_CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
});

export function EventsExperience() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  
  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<{ event: any; ticketCode: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchEvents()
      .then((data) => {
        if (!isMounted) return;
        setEvents(data);
        setError(null);
      })
      .catch((err) => {
        if (isMounted) setError(language === "en" ? "Unable to load events." : "ዝግጅቶችን መጫን አልተቻለም።");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [language]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return events;
    return events.filter((event) => event.category === activeCategory);
  }, [activeCategory, events]);

  const handleRegisterEvent = async (eventId: string) => {
    if (!session) {
      toast.error(language === "en" ? "Please login to RSVP for events!" : "ለዝግጅቶች ለመመዝገብ እባክዎ ይግቡ!");
      return;
    }
    const isJoined = joinedEvents.includes(eventId);
    try {
      if (isJoined) {
        await unregisterFromEvent(eventId);
        setJoinedEvents((current) => current.filter((id) => id !== eventId));
        toast.info(language === "en" ? "RSVP cancelled." : "ምዝገባው ተሰርዟል።");
      } else {
        await registerForEvent(eventId);
        setJoinedEvents((current) => [...current, eventId]);

        // Get QR ticket code from backend
        const res = await fetch("/api/events/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });
        if (res.ok) {
          const rsvpData = await res.json();
          const evt = events.find((e) => e._id === eventId);
          setSelectedTicket({ event: evt, ticketCode: rsvpData.ticketCode });
          toast.success(language === "en" ? "RSVP Confirmed! Your digital QR ticket is ready." : "ምዝገባዎ ተረጋገጠ! የእርስዎ ዲጂታል QR ቲኬት ዝግጁ ነው።");
        }
      }
    } catch (err) {
      toast.error(language === "en" ? "Could not update RSVP." : "RSVP ማዘመን አልተቻለም።");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative py-24 bg-slate-900 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-gold-950/20" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              {language === "en" ? "Fellowship Gatherings" : "የህብረት ስብሰባዎች"}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">{t("navEvents")}</h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
              {language === "en"
                ? "Join upcoming youth meetings, regional retreats, conferences, and prayer nights."
                : "በቅርቡ የሚካሄዱ የወጣቶች ስብሰባዎች፣ ኮንፈረንሶች እና የጸሎት ምሽቶችን ይቀላቀሉ።"}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex gap-2 flex-wrap justify-center mb-12"
        >
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground border-primary shadow-sm gold-glow scale-105"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {category === "all" ? (language === "en" ? "All Activities" : "ሁሉም ዝግጅቶች") : category}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={36} />
            <p className="text-muted-foreground text-sm font-medium">{language === "en" ? "Loading events…" : "ዝግጅቶች እየተጫኑ ነው…"}</p>
          </div>
        ) : error ? (
          <EmptyState message={error} icon={<AlertCircle size={36} className="text-destructive" />} />
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
              {filteredEvents.map((event, i) => (
                <motion.div key={event._id} {...fadeUp(i)} layout>
                  <EventCard
                    event={event}
                    isRegistered={joinedEvents.includes(event._id)}
                    language={language}
                    onRegister={handleRegisterEvent}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            message={language === "en" ? "No upcoming events found for this category." : "በዚህ ምድብ ምንም መጪ ዝግጅት አልተገኘም።"}
            icon={<Calendar size={36} className="text-muted-foreground" />}
          />
        )}
        {/* QRCode Modal */}
        <QRCodePassModal
          isOpen={!!selectedTicket}
          event={selectedTicket?.event}
          ticketCode={selectedTicket?.ticketCode || ""}
          userName={(session?.user as any)?.name || "YSF Member"}
          onClose={() => setSelectedTicket(null)}
        />
      </div>
    </main>
  );
}

function EventCard({
  event,
  isRegistered,
  language,
  onRegister,
}: {
  event: EventDto;
  isRegistered: boolean;
  language: string;
  onRegister: (eventId: string) => void;
}) {
  const eventDate = new Date(event.date);

  // Generate a consistent but distinct gradient based on the event ID or title length
  const gradientIndex = (event.title.length % 3) + 1;
  const gradientClass = 
    gradientIndex === 1 ? "from-gold-600 to-amber-700" :
    gradientIndex === 2 ? "from-blue-600 to-indigo-800" :
    "from-emerald-600 to-teal-800";

  return (
    <article className="relative h-[420px] rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500">
      {/* Background Image / Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-transform duration-700 group-hover:scale-105`}>
        {event.images && event.images.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover mix-blend-overlay opacity-80" />
        )}
        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
      </div>

      {/* Top Badges */}
      <div className="absolute top-5 inset-x-5 flex justify-between items-start z-10">
        <Badge variant="outline" className="text-white border-white/30 font-black text-[10px] uppercase tracking-widest bg-white/10 backdrop-blur-md shadow-lg">
          {event.category}
        </Badge>
        {event.isLive && (
          <Badge variant="outline" className="text-white border-rose-500/50 font-black text-[10px] uppercase tracking-widest bg-rose-500/80 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.6)]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Now
          </Badge>
        )}
      </div>

      {/* Glassmorphism Content Overlay */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-10">
        <div className="p-5 rounded-2xl bg-white/10 dark:bg-slate-950/40 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col gap-4 transition-transform duration-300">
          
          <div>
            <h3 className="font-black text-xl text-white leading-tight drop-shadow-md line-clamp-1">
              {event.title}
            </h3>
            <p className="text-sm text-slate-200 mt-1.5 font-medium line-clamp-2 drop-shadow">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gold-400" />
              <span>{eventDate.toLocaleDateString(language === "en" ? "en-US" : "am-ET", { month: "short", day: "numeric" })} • {eventDate.toLocaleTimeString(language === "en" ? "en-US" : "am-ET", { timeStyle: "short" })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gold-400" />
              <span className="truncate max-w-[120px]">{event.isLive ? event.livePlatform : event.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-1 pt-4 border-t border-white/10">
            {event.isLive && event.liveMeetingUrl ? (
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white hover:text-slate-950 font-bold h-10 rounded-xl transition-all"
                onClick={() => window.open(event.liveMeetingUrl, "_blank")}
              >
                <Video size={16} className="mr-2" />
                {language === "en" ? "Join Stream" : "ቀጥታ ይግቡ"}
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={() => onRegister(event._id)}
              className={`flex-1 h-10 rounded-xl font-bold transition-all shadow-lg ${
                isRegistered
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
                  : "bg-gold-500 hover:bg-gold-600 text-slate-950"
              }`}
            >
              {isRegistered ? (
                <>
                  <Check size={16} className="mr-2" />
                  {language === "en" ? "Registered" : "ተመዝግበዋል"}
                </>
              ) : (
                language === "en" ? "Register / RSVP" : "ይመዝገቡ"
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-card border border-border/60 rounded-3xl">
      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-black text-foreground mb-2">{message}</h3>
    </motion.div>
  );
}
