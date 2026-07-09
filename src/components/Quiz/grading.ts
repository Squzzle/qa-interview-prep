export function isCorrect(selected: number[], correct: number[]): boolean {
  const a = [...new Set(selected)].sort((x, y) => x - y);
  const b = [...new Set(correct)].sort((x, y) => x - y);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
