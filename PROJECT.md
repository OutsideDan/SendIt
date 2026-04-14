> This file is maintained by Claude Code. Update manually for major milestones; the deploy script updates "Last updated" automatically.

# SendIt! — Project Status

**Last updated:** 2026-04-14 (Add user accounts with Firebase login and Firestore cloud sync)
**Live URL:** https://outsidedan.github.io/SendIt/
**Repo:** https://github.com/OutsideDan/SendIt

---

## What It Is

A rock climbing progress tracker built for Mira. She logs climbs (grade, tries, outcome, location) and sees a chart of her improvement over time. No backend — all data lives in the browser via localStorage.

## Stack

- Single `index.html` — HTML + CSS + JS, no build step
- Chart.js v4 + chartjs-adapter-date-fns (CDN, deferred)
- Josefin Sans (Google Fonts)
- GitHub Pages — deploys directly from `main` branch root

## Features Shipped

- Log a climb: grade (V-scale or 5.x), tries, outcome (Flash / Sent It / Fell), project tag, location, notes
- Progress chart: line chart by date, separate datasets for bouldering and sport
- Climb history: cards with delete
- 4 themes: Pastel (default), Glacier, Sunset, Evermore (with animated fairies + sparkles)
- localStorage persistence — data survives refresh

## Known Limitations

- Data is per-browser, per-device — no sync between phone and laptop
- No user accounts or sharing yet

## Deployment

```
npm run check    # run pre-deploy checks only
npm run deploy   # run checks + push to GitHub → Pages auto-serves
```

GitHub Pages is configured to serve from `main` branch root. Push to main = live.
