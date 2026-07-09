// Prepare the answer-page generation phase:
//  - write section-level and block-level _category_.json (controller owns these,
//    so generation agents never write the same file concurrently)
//  - assign a stable sidebar_position to each question within its block
//  - split each block into chunks of <=12 questions; write one chunk worklist
//    file per chunk; emit a manifest the generation workflow fans out over
//
// Usage: node scripts/prep-generation.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SECTIONS = [
  { section: 'manual-qa', label: 'Manual QA — теория', position: 1 },
  { section: 'automation-qa', label: 'Automation QA', position: 2 },
  { section: 'sql', label: 'Лайвкодинг SQL', position: 3 },
  { section: 'hr', label: 'HR и вопросы интервьюеру', position: 4 },
];
const CHUNK = 12;
const CHUNK_DIR = 'data/inventory/chunks';

if (!existsSync(CHUNK_DIR)) mkdirSync(CHUNK_DIR, { recursive: true });

const manifest = [];
let totalPages = 0;
let totalBlocks = 0;

for (const { section, label, position } of SECTIONS) {
  const items = JSON.parse(readFileSync(`data/inventory/${section}.json`, 'utf8'));

  // section-level category
  const secDir = `docs/${section}`;
  mkdirSync(secDir, { recursive: true });
  writeFileSync(join(secDir, '_category_.json'),
    JSON.stringify({ label, position, link: { type: 'generated-index' } }, null, 2));

  // group by block, preserve inventory order
  const byBlock = new Map();
  for (const it of items) {
    if (!byBlock.has(it.block)) byBlock.set(it.block, []);
    byBlock.get(it.block).push(it);
  }

  for (const [block, blockItems] of byBlock) {
    totalBlocks += 1;
    const blockLabel = blockItems[0].blockLabel;
    const blockPos = blockItems[0].position;
    const blockDir = join(secDir, block);
    mkdirSync(blockDir, { recursive: true });
    // block-level category
    writeFileSync(join(blockDir, '_category_.json'),
      JSON.stringify({ label: blockLabel, position: blockPos, link: { type: 'generated-index' } }, null, 2));

    // assign sidebar_position (1..N) and chunk
    const withPos = blockItems.map((it, i) => ({
      slug: it.slug, question: it.question, sidebar_position: i + 1, blockLabel,
    }));
    totalPages += withPos.length;
    for (let i = 0; i < withPos.length; i += CHUNK) {
      const idx = i / CHUNK;
      const chunkItems = withPos.slice(i, i + CHUNK);
      const path = join(CHUNK_DIR, `${section}__${block}__${idx}.json`);
      writeFileSync(path, JSON.stringify({ section, block, blockLabel, items: chunkItems }, null, 2));
      manifest.push({ path, section, block, blockLabel, count: chunkItems.length });
    }
  }
}

writeFileSync(join(CHUNK_DIR, '_manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`sections: ${SECTIONS.length}, blocks: ${totalBlocks}, chunks: ${manifest.length}, pages: ${totalPages}`);
console.log(`manifest: ${join(CHUNK_DIR, '_manifest.json')}`);
