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

Do not wait until after implementation to design the check.

### When Writing Instructions or Explanations (for Mira)
- Avoid assumed technical knowledge
- Plain language over jargon; define jargon when it comes up
- Step-by-step beats abstract description
