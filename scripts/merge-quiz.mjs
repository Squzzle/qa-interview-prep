// Merge per-block quiz files (data/quiz/blocks/<section>__<block>.json) into
// per-section bank files (data/quiz/<section>.json) that the site loads, then
// drop the temporary sample fixture.
//
// Usage: node scripts/merge-quiz.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const BLOCKS_DIR = 'data/quiz/blocks';
const OUT_DIR = 'data/quiz';

const files = readdirSync(BLOCKS_DIR).filter((f) => f.endsWith('.json'));
const bySection = new Map();
let total = 0;

for (const f of files) {
  const section = f.split('__')[0];
  const arr = JSON.parse(readFileSync(join(BLOCKS_DIR, f), 'utf8'));
  if (!Array.isArray(arr)) throw new Error(`${f}: expected an array`);
  if (!bySection.has(section)) bySection.set(section, []);
  bySection.get(section).push(...arr);
  total += arr.length;
}

for (const [section, items] of [...bySection.entries()].sort()) {
  writeFileSync(join(OUT_DIR, `${section}.json`), JSON.stringify(items, null, 2));
  console.log(`  ${section}.json: ${items.length} questions`);
}

// remove temporary fixture from Task 3
const sample = join(OUT_DIR, 'sample.json');
if (existsSync(sample)) { rmSync(sample); console.log('  removed sample.json'); }

console.log(`TOTAL quiz questions: ${total} across ${bySection.size} sections`);
