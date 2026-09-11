# ✅ To Do — PWA

A simple, modern, offline-first To-Do List. Vanilla HTML/CSS/JS, zero build step, zero dependencies.

## Features

* **Add / toggle / delete tasks** with filters (All / Active / Done)
* **Local persistence** — tasks survive reload and offline use
* **Installable PWA** — app icon, standalone window, offline caching via service worker
* **Dark mode** — follows system preference
* **Accessible** — keyboard friendly, ARIA labels, semantic markup

## Run

Serve the folder (PWA needs HTTP/HTTPS, not `file://`). Any static server works:

```bash
npx serve .        # or: python -m http.server 8080
```

Open `http://localhost:8080`, then install the app from the browser's address bar (Chrome/Edge: the install icon).

## Test

```bash
node test.js
```

Core logic lives in `tasks.js` (pure functions, shared between browser and tests).

## Project layout

```
index.html            app shell
style.css             styling (dark-mode aware)
tasks.js              pure to-do logic
script.js             DOM glue + service worker registration
sw.js                 service worker (offline cache)
manifest.webmanifest  PWA manifest
Assets/icons/         generated icons
generate-icons.js     icon generator (node, no deps)
test.js               logic tests
```
