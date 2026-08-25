"use client";

import { useState, useEffect } from "react";

const AUDIO_CACHE_NAME = "yabbok-audio-v1";

export function useOfflineAudio(audioUrl?: string) {
  const [isCached, setIsCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!audioUrl || typeof window === "undefined" || !("caches" in window)) return;

    caches.open(AUDIO_CACHE_NAME).then(async (cache) => {
      const match = await cache.match(audioUrl);
      setIsCached(!!match);
    });
  }, [audioUrl]);

  const downloadAudio = async () => {
    if (!audioUrl || typeof window === "undefined" || !("caches" in window)) return;

    setIsDownloading(true);
    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const response = await fetch(audioUrl);
      if (response.ok) {
        await cache.put(audioUrl, response);
        setIsCached(true);
      }
    } catch (e) {
      console.error("Failed to download audio for offline use", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const removeAudio = async () => {
    if (!audioUrl || typeof window === "undefined" || !("caches" in window)) return;

    try {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      await cache.delete(audioUrl);
      setIsCached(false);
    } catch (e) {
      console.error("Failed to remove cached audio", e);
    }
  };

  return {
    isCached,
    isDownloading,
    downloadAudio,
    removeAudio,
  };
}
