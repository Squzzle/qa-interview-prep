// Validate the quiz bank (data/quiz/*.json). Each question must have exactly 5
// options, 1..5 correct indices within range, a non-empty id, and a topicUrl
// that resolves to an existing docs page. Exits non-zero on any error so it can
// gate the build.
//
// Usage: node scripts/validate-quiz.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const quizDir = 'data/quiz';
let count = 0;
let errors = 0;
const ids = new Set();

// /docs/a/b/slug -> docs/a/b/slug.md (or .mdx, or index.md)
function topicExists(url) {
  if (typeof url !== 'string' || !url.startsWith('/docs/')) return false;
  const rel = url.replace(/^\/docs\//, 'docs/').replace(/\/+$/, '');
  return existsSync(rel + '.md') || existsSync(rel + '.mdx') || existsSync(join(rel, 'index.md'));
}

const files = existsSync(quizDir)
  ? readdirSync(quizDir).filter((f) => f.endsWith('.json'))
  : [];

if (files.length === 0) {
  console.error(`No quiz files found in ${quizDir}`);
  process.exit(1);
}

for (const f of files) {
  let items;
  try {
    items = JSON.parse(readFileSync(join(quizDir, f), 'utf8'));
  } catch (e) {
    console.error(`${f}: invalid JSON — ${e.message}`);
    errors += 1;
    continue;
  }
  if (!Array.isArray(items)) {
    console.error(`${f}: top-level value must be an array`);
    errors += 1;
    continue;
  }
  for (const q of items) {
    count += 1;
    const bad = [];
    if (!q.id) bad.push('missing id');
    else if (ids.has(q.id)) bad.push(`duplicate id "${q.id}"`);
    else ids.add(q.id);
    if (!q.question) bad.push('missing question');
    if (!Array.isArray(q.options) || q.options.length !== 5) bad.push(`options must be exactly 5 (got ${q.options ? q.options.length : 'none'})`);
    if (!Array.isArray(q.correct) || q.correct.length < 1 || q.correct.length > 5) bad.push('correct must have 1..5 indices');
    else if (q.correct.some((i) => !Number.isInteger(i) || i < 0 || i > 4)) bad.push('correct indices out of range 0..4');
    else if (new Set(q.correct).size !== q.correct.length) bad.push('correct has duplicate indices');
    if (!topicExists(q.topicUrl)) bad.push(`topicUrl not found: ${q.topicUrl}`);
    if (bad.length) {
      errors += 1;
      console.error(`${f} [${q.id || '?'}]: ${bad.join('; ')}`);
    }
  }
}

console.log(`Проверено вопросов: ${count}, файлов: ${files.length}, ошибок: ${errors}`);
process.exit(errors ? 1 : 0);
