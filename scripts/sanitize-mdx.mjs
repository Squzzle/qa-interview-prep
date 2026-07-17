// Escape MDX-hostile characters (<, {, }) in generated answer pages, but ONLY
// in prose — never inside fenced code blocks, inline `code` spans, or the YAML
// frontmatter. MDX parses a bare `<` as a JSX tag and a bare `{` as an
// expression, which breaks the build; the HTML entities render identically.
//
// Usage: node scripts/sanitize-mdx.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['docs/manual-qa', 'docs/automation-qa', 'docs/sql', 'docs/hr', 'docs/typescript'];

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith('.md') || name.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

function escapeProse(segment) {
  return segment
    .replace(/</g, '&lt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function sanitize(content) {
  const lines = content.split('\n');
  const out = [];
  let inFence = false;
  let inFM = false;
  let changed = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const t = line.trim();

    if (i === 0 && t === '---') { inFM = true; out.push(line); continue; }
    if (inFM) { out.push(line); if (t === '---') inFM = false; continue; }

    if (t.startsWith('```') || t.startsWith('~~~')) { inFence = !inFence; out.push(line); continue; }
    if (inFence) { out.push(line); continue; }

    // Split on inline-code spans; escape only the non-code segments (even idx).
    const newLine = line.split(/(`[^`]*`)/).map((seg, idx) => (idx % 2 === 1 ? seg : escapeProse(seg))).join('');
    if (newLine !== line) changed = true;
    out.push(newLine);
  }
  return { text: out.join('\n'), changed };
}

const files = [];
for (const r of ROOTS) walk(r, files);

let changedCount = 0;
for (const f of files) {
  const { text, changed } = sanitize(readFileSync(f, 'utf8'));
  if (changed) { writeFileSync(f, text); changedCount += 1; }
}
console.log(`Sanitized ${changedCount}/${files.length} files.`);
