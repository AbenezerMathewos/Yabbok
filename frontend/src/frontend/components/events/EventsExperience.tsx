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

  return (
    <article className="h-full p-7 rounded-3xl bg-card border border-border/60 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start gap-2 mb-4">
          <Badge variant="outline" className="text-primary border-primary/30 font-bold text-[10px] uppercase tracking-wider bg-primary/5">
            {event.category}
          </Badge>
          {event.isLive && (
            <Badge variant="outline" className="text-destructive border-destructive/30 font-bold text-[10px] uppercase tracking-wider bg-destructive/5 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              Live
            </Badge>
          )}
        </div>

        <h3 className="font-black text-xl md:text-2xl text-foreground mt-2 leading-tight">
          {event.title}
        </h3>

        <p className="text-sm text-muted-foreground mt-3 leading-relaxed font-medium">
          {event.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 rounded-2xl bg-muted/30 border border-border/50 text-sm">
          <div className="flex items-center gap-3 text-foreground font-semibold">
            <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border/50">
              <Clock size={16} className="text-primary" />
            </div>
            <div>
              <span className="block">{eventDate.toLocaleDateString(language === "en" ? "en-US" : "am-ET", { dateStyle: "medium" })}</span>
              <span className="text-[10px] text-muted-foreground font-bold">{eventDate.toLocaleTimeString(language === "en" ? "en-US" : "am-ET", { timeStyle: "short" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-foreground font-semibold">
            <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border/50">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <span className="block truncate max-w-[140px]" title={event.location}>{event.location}</span>
              <span className="text-[10px] text-muted-foreground font-bold">{event.isLive ? event.livePlatform : language === "en" ? "Physical Venue" : "ቦታ"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        {event.isLive && event.liveMeetingUrl ? (
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold h-11 px-5 rounded-xl gap-2 transition-all shrink-0"
            onClick={() => window.open(event.liveMeetingUrl, "_blank")}
          >
            <Video size={16} />
            {language === "en" ? "Join Stream" : "ቀጥታ ይግቡ"}
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={() => onRegister(event._id)}
          className={`h-11 px-6 rounded-xl font-bold transition-all shadow-sm ${
            isRegistered
              ? "bg-emerald-500 text-white hover:bg-emerald-600 gap-2"
              : "bg-primary text-primary-foreground hover:bg-primary/90 gold-glow"
          }`}
        >
          {isRegistered ? (
            <>
              <Check size={16} />
              {language === "en" ? "Registered" : "ተመዝግበዋል"}
            </>
          ) : (
            language === "en" ? "Register / RSVP" : "ይመዝገቡ"
          )}
        </Button>
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
