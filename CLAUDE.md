# CLAUDE.md — climb-tracker

_Parent rules apply: read `../CLAUDE.md` before this file._

## What this project is

A rock climbing progress tracker. Mira logs her climbs and sees a chart of her improvement over time. Possibly shared with her dad so she can prove she's better than him.

## How to work with Mira on this

- This is a learning project — the goal is for Mira to understand what's being built, not just watch it get built
- Explain what you're doing before you do it, in plain terms
- When something new comes up (a concept, a tool, a file type), give a one-sentence explanation — don't skip it, don't over-explain it
- If Mira seems stuck or confused, slow down and ask a question instead of just pushing forward
- Suggest a non-cheesy name for the app if one comes up naturally — she wants one

## Session Start Protocol

1. Read `../CLAUDE.md` (parent rules + Mira's onboarding)
2. Read this file
3. Read `intent.md`
4. Greet Mira, remind her where things stand, and ask what she wants to work on today

---

## Note for Mira — Last Session (2026-04-13)

Hey Mira! Last session was a big one. Here's what we built:

**Accounts are live.** SendIt now has a real login system. Anyone can go to the app, create an account with a username and PIN, and log in from any device — phone, laptop, wherever. Your climbs are saved to the cloud (Firebase, which is basically Google's database) instead of just your browser, so they follow you around.

**What we actually did:**
- Added Firebase to the app — that's the service that stores everyone's data online
- Built the account screen you see when you first open the app (Log In / Create Account)
- PINs get scrambled before they're saved (it's called hashing — so even I can't read your PIN from the database)
- Username taken? It tells you. Wrong PIN? It tells you. It doesn't just silently fail.
- "Switch Account" button in the header so multiple people can use the app on the same device

**One thing to know:** usernames are lowercased automatically, so `Mira` and `mira` are the same account. Pick whatever nickname you want — just remember it.

**Next up (ideas, not a to-do):**
- Deploy it live so anyone can use it (`npm run deploy`)
- Dad comparison view — now that accounts exist, it's actually possible
- Anything else you want to add

What do you want to work on today?

---

## Universal Rules

### Behavior
- Read this file and `intent.md` before starting any task
- Before any large rewrite, multi-step task, or significant structural change: present a plan and wait for approval
- Keep responses concise — bullets over prose, short over long
- When referencing files, use paths relative to the project root
- Do not propose a solution before the real problem is understood — ask if the stated problem and the real problem appear to be different
- Do not build without legible intent — if a task can't be specified clearly, surface that gap before proceeding
- Flag speculative complexity — if something isn't clearly needed for the stated goal, say so before adding it

### Content
- Use kebab-case for new filenames (e.g. `climb-log.js`, not `climbLog.js`)
- Never commit passwords, API keys, or tokens
- Cross-reference related files when relevant

### Continuous Improvement
- Proactively update this file and `intent.md` when context becomes outdated, missing, or wrong
- Flag performance, reliability, or structural improvements when noticed; fix low-risk issues immediately, propose significant ones first
- Write to project memory when something learned in a session should persist

### Embedded Tests
Every plan for a new feature or file must include:
- What error it catches
- Where it fires
- What format the check takes

Implementing that check in `scripts/pre-deploy.js` is part of the feature — not optional, not later. A feature is not done until its check is in the script.

### When Writing Instructions or Explanations (for Mira)
- Avoid assumed technical knowledge
- Plain language over jargon; define jargon when it comes up
- Step-by-step beats abstract description

---

## Deployment

**Live URL:** https://outsidedan.github.io/SendIt/
**Repo:** https://github.com/OutsideDan/SendIt
**Hosting:** GitHub Pages — serves `main` branch root directly. No build step.

### How to deploy
```
npm run check    # run checks without deploying
npm run deploy   # run checks + git push → live within ~30s
```

The `predeploy` hook in `package.json` runs `scripts/pre-deploy.js` automatically before every push. It blocks deploy on hard failures (missing labels, localhost URLs in code) and warns on soft issues (file size, missing hints).

### What gets checked (`scripts/pre-deploy.js`)
- All `<input>` elements have `<label for="...">` associations
- All `<button>` elements have text, aria-label, or title
- Page has `<title>` and viewport meta
- `index.html` under 250 KB (warn) / 500 KB (block)
- No `console.log` statements left in
- No `localhost:` URLs hardcoded
- External scripts have `defer` or `async`
- `preconnect` hints present for CDN hosts

### What is NOT checked
- WCAG color contrast — theme colors are Mira's creative choices, not a compliance target

### After every deploy
- `DEPLOY_LOG.md` is auto-updated with commit hash, message, and changed files
- `PROJECT.md` "Last updated" line is auto-updated

### GitHub Actions
`.github/workflows/checks.yml` runs `pre-deploy.js --check-only` on every push to `main` and on pull requests. This is the CI gate — visible in the repo's Actions tab.
