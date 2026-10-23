// Service worker: αποθηκεύει όλα τα αρχεία ώστε το παιχνίδι να παίζεται χωρίς σήμα (π.χ. στο μετρό).
// Το VERSION το ενημερώνει αυτόματα το tools/build_schedule.py σε κάθε αλλαγή τράπεζας/προγράμματος.
const VERSION = "fc-b9-20261023061010";
const FILES = ["./", "index.html", "questions.js", "schedule.js", "explanations.js", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Πρώτα το δίκτυο (για να έρχονται ενημερώσεις), αλλιώς η αποθηκευμένη έκδοση.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
