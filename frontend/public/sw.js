const CACHE_NAME = "yabbok-shell-v1";
const AUDIO_CACHE = "yabbok-audio-v1";

const STATIC_ASSETS = [
  "/",
  "/sermons",
  "/devotional",
  "/events",
  "/prayer",
  "/manifest.json",
];

// Install event - precache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== AUDIO_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle audio and network requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Check if request is an audio file
  const isAudio = url.pathname.endsWith(".mp3") || 
                  url.pathname.endsWith(".m4a") || 
                  url.pathname.endsWith(".wav") || 
                  event.request.headers.get("accept")?.includes("audio");

  if (isAudio) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          return new Response("Offline audio unavailable", { status: 503 });
        }
      })
    );
    return;
  }

  // Default network-first fallback to cache strategy for pages
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((res) => {
        if (res) return res;
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});
