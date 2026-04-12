#!/usr/bin/env node
/**
 * pre-deploy.js
 * Runs automatically before every `npm run deploy` via the predeploy hook.
 *
 * Default mode:
 *   1. Accessibility and usability checks against index.html
 *   2. Performance: file size check
 *   3. Hygiene: no console.log, no localhost URLs left in
 *   4. Update PROJECT.md "Last updated"
 *   5. Append entry to DEPLOY_LOG.md
 *   6. Stage + commit docs
 *   7. Print summary
 *   Exits 1 (blocks deploy) on: missing labels, localhost URLs in code.
 *
 * --check-only  Run all checks and print results; skip git/docs work.
 *               Useful for reviewing output without deploying.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check-only');

function read(rel)        { return readFileSync(resolve(ROOT, rel), 'utf8'); }
function write(rel, text) { writeFileSync(resolve(ROOT, rel), text, 'utf8'); }
function exists(rel)      { return existsSync(resolve(ROOT, rel)); }
function git(cmd)         { return execSync(cmd, { cwd: ROOT }).toString().trim(); }

const html = read('index.html');

// ── Result collector ──────────────────────────────────────────────────────────

const results = { pass: [], warn: [], fail: [] };
function pass(msg) { results.pass.push(msg); }
function warn(msg) { results.warn.push(msg); }
function fail(msg) { results.fail.push(msg); }

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Accessibility: input labels ───────────────────────────────────────────────
// Every <input> with an id should have a <label for="..."> pointing to it.

const inputIds = [...html.matchAll(/<input[^>]+\bid="([^"]+)"/g)].map(m => m[1]);
const labelFors = [...html.matchAll(/<label[^>]+\bfor="([^"]+)"/g)].map(m => m[1]);

const unlabeled = inputIds.filter(id => !labelFors.includes(id));
if (unlabeled.length === 0) {
  pass(`All <input> elements have associated <label for="...">`);
} else {
  unlabeled.forEach(id => fail(`<input id="${id}"> has no matching <label for="${id}">`));
}

// ── Accessibility: buttons have accessible names ──────────────────────────────
// Buttons must have text content, aria-label, or title.

const buttonMatches = [...html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)];
let emptyButtons = 0;
for (const [, attrs, content] of buttonMatches) {
  const hasText    = content.trim().length > 0;
  const hasAria    = /aria-label\s*=/i.test(attrs);
  const hasTitle   = /\btitle\s*=/i.test(attrs);
  if (!hasText && !hasAria && !hasTitle) emptyButtons++;
}
if (emptyButtons === 0) {
  pass('All <button> elements have accessible names');
} else {
  warn(`${emptyButtons} button(s) have no text, aria-label, or title`);
}

// ── Accessibility: page title ─────────────────────────────────────────────────

if (/<title>[^<]+<\/title>/.test(html)) {
  pass('Page has a <title>');
} else {
  fail('Missing <title> element');
}

// ── Accessibility: lang attribute on <html> ───────────────────────────────────

if (/<html[^>]+\blang\s*=/.test(html)) {
  pass('<html> has lang attribute');
} else {
  warn('<html> is missing a lang attribute (screen readers use this)');
}

// ── Accessibility: viewport meta ─────────────────────────────────────────────

if (/name="viewport"/.test(html)) {
  pass('Viewport meta tag present');
} else {
  fail('Missing viewport meta tag — app will not scale correctly on phones');
}

// ── Performance: file size ────────────────────────────────────────────────────

import { statSync } from 'fs';
const sizeKB = Math.round(statSync(resolve(ROOT, 'index.html')).size / 1024);
const SIZE_WARN_KB = 250;
const SIZE_FAIL_KB = 500;

if (sizeKB > SIZE_FAIL_KB) {
  fail(`index.html is ${sizeKB} KB — exceeds ${SIZE_FAIL_KB} KB hard limit. Consider splitting assets.`);
} else if (sizeKB > SIZE_WARN_KB) {
  warn(`index.html is ${sizeKB} KB — over ${SIZE_WARN_KB} KB. Fine for now, watch this.`);
} else {
  pass(`index.html is ${sizeKB} KB — within budget`);
}

// ── Hygiene: no console.log left in ──────────────────────────────────────────

const consoleLogs = [...html.matchAll(/console\.log\s*\(/g)];
if (consoleLogs.length === 0) {
  pass('No console.log statements found');
} else {
  warn(`${consoleLogs.length} console.log statement(s) left in — remove before deploying`);
}

// ── Hygiene: no localhost URLs in source ──────────────────────────────────────

const localhostMatches = [...html.matchAll(/localhost:\d+/g)];
if (localhostMatches.length === 0) {
  pass('No localhost URLs in source');
} else {
  localhostMatches.forEach(m => fail(`Hardcoded localhost URL found: ${m[0]}`));
}

// ── Hygiene: CDN scripts use defer ───────────────────────────────────────────

const scriptTags = [...html.matchAll(/<script\s+src="([^"]+)"([^>]*)>/g)];
let missingDefer = 0;
for (const [, src, attrs] of scriptTags) {
  if (!/\bdefer\b/.test(attrs) && !/\basync\b/.test(attrs)) {
    warn(`Script without defer/async (blocks render): ${src}`);
    missingDefer++;
  }
}
if (missingDefer === 0) {
  pass('All external <script> tags have defer or async');
}

// ── Hygiene: preconnect hints present for CDNs ────────────────────────────────

const cdnHosts = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
for (const host of cdnHosts) {
  if (html.includes(`preconnect" href="https://${host}`)) {
    pass(`preconnect hint present for ${host}`);
  } else {
    warn(`Missing <link rel="preconnect"> for ${host}`);
  }
}

// ── Icons: all PWA/favicon files present ─────────────────────────────────────

const iconFiles = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];
const missingIcons = iconFiles.filter(f => !exists(f));
if (missingIcons.length === 0) {
  pass('All favicon/icon files present');
} else {
  missingIcons.forEach(f => fail(`Missing icon file: ${f} — run: npm run icons`));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINT RESULTS
// ═══════════════════════════════════════════════════════════════════════════════

const divider = '─'.repeat(67);

const sections = [
  {
    title: 'Accessibility',
    filter: m => /label|button|title|lang|viewport/i.test(m),
  },
  {
    title: 'Performance',
    filter: m => /KB|defer|async|preconnect|icon|favicon/i.test(m),
  },
  {
    title: 'Hygiene',
    filter: m => /console|localhost/i.test(m),
  },
];

console.log(`\n${divider}`);
console.log('  SendIt! — Pre-deploy checks');
console.log(divider);

for (const { title, filter } of sections) {
  const items = [
    ...results.fail.filter(filter),
    ...results.warn.filter(filter),
    ...results.pass.filter(filter),
  ];
  if (!items.length) continue;
  console.log(`\n  ── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`);
  for (const item of items) {
    const symbol = results.fail.includes(item) ? '✗' : results.warn.includes(item) ? '⚠' : '✓';
    console.log(`  ${symbol}  ${item}`);
  }
}

const { fail: failures, warn: warnings, pass: passes } = results;
console.log(`\n${divider}`);
console.log(`  ${passes.length} passed  |  ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}  |  ${failures.length} failure${failures.length !== 1 ? 's' : ''}`);
if (failures.length > 0) {
  console.log('  Deploy BLOCKED — fix failures above before deploying.');
}
console.log(divider);

if (CHECK_ONLY) process.exit(failures.length > 0 ? 1 : 0);

// ═══════════════════════════════════════════════════════════════════════════════
// DOCS UPDATES (skipped in --check-only mode)
// ═══════════════════════════════════════════════════════════════════════════════

if (failures.length > 0) process.exit(1);

const shortHash = git('git rev-parse --short HEAD');
const fullHash  = git('git rev-parse HEAD');
const commitMsg = git('git log -1 --pretty=%s');
const filesRaw  = git('git diff-tree --no-commit-id -r --name-only HEAD');
const changedFiles = filesRaw.split('\n').filter(Boolean);

const now     = new Date();
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().slice(0, 8);

// ── Update PROJECT.md last-updated line ───────────────────────────────────────

if (exists('PROJECT.md')) {
  let project = read('PROJECT.md');
  project = project.replace(
    /\*\*Last updated:\*\* .+/,
    `**Last updated:** ${dateStr} (${commitMsg})`
  );
  write('PROJECT.md', project);
}

// ── Append to DEPLOY_LOG.md ───────────────────────────────────────────────────

const LOG_HEADER = '> This file is maintained by Claude Code. Do not edit manually.\n\n# Deploy Log\n\n---\n\n';

const entry = [
  `## ${dateStr} ${timeStr}`,
  '',
  `- **Commit:** \`${shortHash}\` \`${fullHash}\``,
  `- **Message:** ${commitMsg}`,
  `- **Files changed:**`,
  ...changedFiles.map(f => `  - \`${f}\``),
  '',
  '---',
  '',
].join('\n');

if (!exists('DEPLOY_LOG.md')) {
  write('DEPLOY_LOG.md', LOG_HEADER + entry);
} else {
  const existing = read('DEPLOY_LOG.md');
  const anchor   = '# Deploy Log\n\n---\n\n';
  const idx      = existing.indexOf(anchor);
  write('DEPLOY_LOG.md',
    idx !== -1
      ? existing.slice(0, idx + anchor.length) + entry + existing.slice(idx + anchor.length)
      : existing + '\n' + entry
  );
}

// ── Stage and commit docs ─────────────────────────────────────────────────────

const filesToStage = ['PROJECT.md', 'DEPLOY_LOG.md'].filter(f => exists(f));
if (filesToStage.length) {
  execSync(`git add ${filesToStage.join(' ')}`, { cwd: ROOT });
  try {
    execSync(`git commit -m "chore: pre-deploy docs update ${dateStr}"`, { cwd: ROOT, stdio: 'pipe' });
  } catch {
    // Nothing to commit — docs unchanged
  }
}

// ── Deploy summary ────────────────────────────────────────────────────────────

console.log(`\n${divider}`);
console.log('  Deploy summary');
console.log(divider);
console.log(`  Commit:   ${shortHash}  ${commitMsg}`);
if (changedFiles.length) {
  console.log(`  Changed (${changedFiles.length} file${changedFiles.length !== 1 ? 's' : ''}):`);
  changedFiles.forEach(f => console.log(`    ${f}`));
}
console.log(`${divider}\n`);

process.exit(0);
