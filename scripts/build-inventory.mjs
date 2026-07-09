// Merge per-block inventory files (data/inventory/blocks/*.json) into per-section
// inventory files (data/inventory/<section>.json), assigning a deterministic,
// unique slug to every question. The slug is the single source of truth used
// both for the answer page path (Task 8) and the quiz topicUrl (Task 9).
//
// Usage: node scripts/build-inventory.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOCKS_DIR = 'data/inventory/blocks';
const OUT_DIR = 'data/inventory';

// Cyrillic -> Latin transliteration for slugs.
const MAP = {
  а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'y',
  к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f',
  х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'', э:'e', ю:'yu', я:'ya',
};

function translit(s) {
  return s.split('').map((ch) => {
    const lower = ch.toLowerCase();
    if (MAP[lower] !== undefined) return MAP[lower];
    return ch;
  }).join('');
}

function slugify(text) {
  const base = translit(text.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // keep it short: first ~8 tokens, capped length
  const short = base.split('-').filter(Boolean).slice(0, 8).join('-').slice(0, 60)
    .replace(/-+$/g, '');
  return short || 'q';
}

function uniqueSlug(candidate, used) {
  let slug = candidate;
  let n = 2;
  while (used.has(slug)) {
    slug = `${candidate}-${n}`;
    n += 1;
  }
  used.add(slug);
  return slug;
}

const files = readdirSync(BLOCKS_DIR).filter((f) => f.endsWith('.json'));
const bySection = new Map(); // section -> array of items
const problems = [];
let totalQ = 0;

for (const f of files) {
  const b = JSON.parse(readFileSync(join(BLOCKS_DIR, f), 'utf8'));
  const { section, block, blockLabel, position } = b;
  const questions = Array.isArray(b.questions) ? b.questions : [];
  if (!section || !block || !blockLabel || questions.length === 0) {
    problems.push(`${f}: empty or malformed (questions=${questions.length})`);
  }
  const usedInBlock = new Set();
  for (const q of questions) {
    const question = String(q).trim();
    if (!question) continue;
    const slug = uniqueSlug(slugify(question), usedInBlock);
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push({ section, block, blockLabel, position, slug, question });
    totalQ += 1;
  }
}

const summary = [];
for (const [section, items] of [...bySection.entries()].sort()) {
  // stable order: by block position then original order
  items.sort((a, b) => (a.position - b.position));
  writeFileSync(join(OUT_DIR, `${section}.json`), JSON.stringify(items, null, 2));
  const blocks = new Set(items.map((i) => i.block));
  summary.push(`${section}: ${items.length} questions across ${blocks.size} blocks`);
}

console.log('=== Inventory built ===');
summary.forEach((s) => console.log('  ' + s));
console.log(`  TOTAL: ${totalQ} questions`);
if (problems.length) {
  console.log('\n=== Problems ===');
  problems.forEach((p) => console.log('  ! ' + p));
  process.exitCode = 1;
} else {
  console.log('\nNo empty/malformed blocks.');
}
