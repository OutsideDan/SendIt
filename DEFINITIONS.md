> This file is maintained by Claude Code. Add new terms when new concepts, patterns, or conventions are introduced during a session.

# Project Definitions

## Core Terms

**localStorage** — the browser's built-in key-value storage. SendIt! saves all climb data here under the key `mira_climbs`. Data persists across page refreshes but is specific to the browser and device it was logged on.

**grade system** — the two scales supported: V-scale (bouldering: V0–V12) and 5.x / YDS (sport climbing: 5.5–5.12d). The app stores both under the same data model with a `gradeSystem` field.

**outcome** — one of three values logged per climb: `flash` (completed on the very first try), `sent` (completed after multiple tries), or `fell` (did not complete).

**project** — a boolean flag on a climb entry. A "project" is a climb Mira has been working on over multiple sessions. A climb can be both a project AND sent (you can finally send your project).

**theme** — one of four visual styles: Pastel (default, light and colorful), Glacier (deep navy, icy blue), Sunset (warm pink-to-purple gradient), Evermore (enchanted forest with animated fairies and sparkles). Selected theme is saved to localStorage under `mira_theme`.

**Evermore theme** — the fourth theme, inspired by Taylor Swift's evermore Eras Tour section. Features a forest-to-twilight background, firefly sparkle particles, twinkling stars, and two animated SVG fairies. Effects are injected via `buildMagicEffects()` and cleared when switching themes.

**pre-deploy checks** — the `scripts/pre-deploy.js` script that runs automatically before `npm run deploy`. Checks: input label associations, button accessible names, page title, viewport meta, file size, console.log leftovers, localhost URLs, defer on scripts, preconnect hints. Blocks deploy on hard failures.

**GitHub Pages** — the hosting service serving SendIt! live. Configured to deploy from the `main` branch root. Any push to `main` automatically goes live within ~30 seconds.

**CDN** — Content Delivery Network. Chart.js and its date adapter are loaded from `cdn.jsdelivr.net` rather than bundled. This keeps the project build-free but means those scripts require an internet connection.
