// Service worker: αποθηκεύει όλα τα αρχεία ώστε το παιχνίδι να παίζεται χωρίς σήμα (π.χ. στο μετρό).
// Το VERSION το ενημερώνει αυτόματα το tools/build_schedule.py σε κάθε αλλαγή τράπεζας/προγράμματος.
const VERSION = "fc-b9-20261025081140";
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
    // Πάντα έλεγχος με τον server (no-cache: 304 αν δεν άλλαξε), ώστε μια νέα έκδοση να φτάνει στο επόμενο άνοιγμα
    // και όχι μετά τη λήξη της προσωρινής μνήμης HTTP (10′ στο GitHub Pages). Χωρίς σύνδεση → αποθηκευμένη έκδοση.
    fetch(e.request.mode === "navigate" ? new Request(e.request.url) : e.request, { cache: "no-cache" })
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
