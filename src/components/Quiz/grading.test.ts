import {describe, it, expect} from 'vitest';
import {isCorrect} from './grading';

describe('isCorrect', () => {
  it('точное совпадение (порядок неважен)', () => {
    expect(isCorrect([2, 0], [0, 2])).toBe(true);
  });
  it('один правильный из одного', () => {
    expect(isCorrect([3], [3])).toBe(true);
  });
  it('неполный выбор — неверно', () => {
    expect(isCorrect([0], [0, 2])).toBe(false);
  });
  it('лишний выбор — неверно', () => {
    expect(isCorrect([0, 2, 4], [0, 2])).toBe(false);
  });
  it('неправильный вариант — неверно', () => {
    expect(isCorrect([1], [3])).toBe(false);
  });
  it('пустой выбор при непустом правильном — неверно', () => {
    expect(isCorrect([], [1])).toBe(false);
  });
  it('дубликаты в выборе не ломают сравнение', () => {
    expect(isCorrect([0, 0, 2], [0, 2])).toBe(true);
  });
});
