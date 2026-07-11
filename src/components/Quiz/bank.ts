import type {QuizQuestion} from './types';
import {sectionFromContextKey} from './sections';

// webpack require.context: @site — корень проекта Docusaurus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context('@site/data/quiz', false, /\.json$/);

export function loadQuizBank(): QuizQuestion[] {
  return ctx.keys().flatMap((k: string) => {
    const section = sectionFromContextKey(k);
    // The JSON files don't carry a `section` field; tag each question with the
    // section derived from its source file so the UI can filter by section.
    return (ctx(k) as Omit<QuizQuestion, 'section'>[]).map((q) => ({...q, section}));
  });
}
