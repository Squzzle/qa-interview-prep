// Section metadata + helpers for the quiz. A "section" is one top-level area of
// the question bank (one data/quiz/<section>.json file).

export const SECTION_ORDER = ['manual-qa', 'automation-qa', 'sql', 'hr', 'typescript'];

export const SECTION_LABELS: Record<string, string> = {
  'manual-qa': 'Manual QA — теория',
  'automation-qa': 'Automation QA',
  sql: 'Лайвкодинг SQL',
  hr: 'HR и вопросы интервьюеру',
  typescript: 'TypeScript',
};

export function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key;
}

// require.context key ('./manual-qa.json') -> section key ('manual-qa').
export function sectionFromContextKey(key: string): string {
  return key.replace(/^\.\//, '').replace(/\.json$/, '');
}

// Canonical order first, then any unknown sections alphabetically.
export function orderedSections(keys: string[]): string[] {
  const known = SECTION_ORDER.filter((s) => keys.includes(s));
  const extra = keys.filter((s) => !SECTION_ORDER.includes(s)).sort();
  return [...known, ...extra];
}
