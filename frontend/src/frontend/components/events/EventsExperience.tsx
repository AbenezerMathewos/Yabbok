"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Clock, Loader2, MapPin, Video } from "lucide-react";
import { fetchEvents, registerForEvent, unregisterFromEvent } from "@/frontend/lib/api/eventsApi";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { EVENT_CATEGORIES, EventDto } from "@/frontend/types/events";

const CATEGORY_FILTERS = ["all", ...EVENT_CATEGORIES] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

export function EventsExperience() {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchEvents()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setEvents(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);

        if (isMounted) {
          setError(language === "en" ? "Unable to load events." : "Events could not be loaded.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") {
      return events;
    }

    return events.filter((event) => event.category === activeCategory);
  }, [activeCategory, events]);

  const handleRegisterEvent = async (eventId: string) => {
    if (!session) {
      alert(
        language === "en"
          ? "Please register/login to sign up for events!"
          : "Please register/login to sign up for events!"
      );
      return;
    }

    const isJoined = joinedEvents.includes(eventId);

    try {
      if (isJoined) {
        await unregisterFromEvent(eventId);
        setJoinedEvents((current) => current.filter((id) => id !== eventId));
      } else {
        await registerForEvent(eventId);
        setJoinedEvents((current) => [...current, eventId]);
      }
    } catch (err) {
      console.error(err);
      alert(language === "en" ? "Could not update RSVP." : "Could not update RSVP.");
    }
  };

  return (
    <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            {t("navEvents")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {language === "en"
              ? "Join upcoming youth meetings, regional retreats, conferences, and prayer nights."
              : "Join upcoming youth meetings, regional retreats, conferences, and prayer nights."}
          </p>
          <div className="h-1 w-12 bg-gold-500 rounded-full mx-auto mt-4" />
        </div>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition-all border ${
                activeCategory === category
                  ? "bg-gold-500 text-slate-950 border-gold-500 font-bold shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-gold-500"
              }`}
            >
              {category === "all" ? (language === "en" ? "All Activities" : "All Activities") : category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold-500" size={36} />
          </div>
        ) : error ? (
          <EmptyState message={error} />
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={joinedEvents.includes(event._id)}
                language={language}
                onRegister={handleRegisterEvent}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="No upcoming events found for this category." />
        )}
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
    <article className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start gap-2">
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 uppercase">
            {event.category}
          </span>

          {event.isLive && (
            <span className="flex items-center gap-1 text-[9px] bg-red-500/10 text-red-500 font-bold border border-red-500/20 px-2 py-0.5 rounded-full uppercase">
              Live
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white mt-4">
          {event.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6 py-4 border-y border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Clock size={16} className="text-gold-500 shrink-0" />
            <div>
              <span className="block font-bold">
                {eventDate.toLocaleDateString(language, { dateStyle: "medium" })}
              </span>
              <span className="text-[10px] text-slate-400">
                {eventDate.toLocaleTimeString(language, { timeStyle: "short" })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapPin size={16} className="text-gold-500 shrink-0" />
            <div>
              <span className="block font-bold truncate max-w-[150px]" title={event.location}>
                {event.location}
              </span>
              <span className="text-[10px] text-slate-400">
                {event.isLive ? event.livePlatform : language === "en" ? "Physical Venue" : "Physical Venue"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        {event.isLive && event.liveMeetingUrl ? (
          <a
            href={event.liveMeetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Video size={14} />
            <span>{language === "en" ? "Join Live Stream" : "Join Live Stream"}</span>
          </a>
        ) : (
          <div />
        )}

        <button
          onClick={() => onRegister(event._id)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isRegistered
              ? "bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1"
              : "bg-gold-500 text-slate-950 hover:bg-gold-600"
          }`}
        >
          {isRegistered ? (
            <>
              <Check size={12} />
              <span>{language === "en" ? "Registered" : "Registered"}</span>
            </>
          ) : (
            <span>{language === "en" ? "Register / RSVP" : "Register / RSVP"}</span>
          )}
        </button>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
