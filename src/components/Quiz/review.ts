// Classify a single answer option for the results-review screen, comparing the
// user's selection against the correct set. Pure logic, unit-tested.
export type OptionStatus =
  | 'correct-selected' // правильный и выбран
  | 'correct-missed'   // правильный, но не выбран
  | 'wrong-selected'   // неправильный, но выбран
  | 'neutral';         // неправильный и не выбран

export function optionStatus(
  index: number,
  correct: number[],
  selected: number[],
): OptionStatus {
  const isCorrect = correct.includes(index);
  const isSelected = selected.includes(index);
  if (isCorrect) return isSelected ? 'correct-selected' : 'correct-missed';
  return isSelected ? 'wrong-selected' : 'neutral';
}
