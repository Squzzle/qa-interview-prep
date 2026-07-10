export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[]; // ровно 5
  correct: number[]; // 1..5 индексов в options
  topicUrl: string;  // /docs/<section>/<block>/<slug>
}
