import type {QuizQuestion} from './types';

// webpack require.context: @site — корень проекта Docusaurus
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context('@site/data/quiz', false, /\.json$/);

export function loadQuizBank(): QuizQuestion[] {
  return ctx.keys().flatMap((k: string) => ctx(k) as QuizQuestion[]);
}
