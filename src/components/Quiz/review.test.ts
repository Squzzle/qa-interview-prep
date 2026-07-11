import {describe, it, expect} from 'vitest';
import {optionStatus} from './review';

describe('optionStatus', () => {
  it('правильный вариант, который пользователь выбрал', () => {
    expect(optionStatus(0, [0, 2], [0, 2])).toBe('correct-selected');
  });
  it('правильный вариант, который пользователь пропустил', () => {
    expect(optionStatus(2, [0, 2], [0])).toBe('correct-missed');
  });
  it('неправильный вариант, который пользователь выбрал', () => {
    expect(optionStatus(3, [0, 2], [0, 3])).toBe('wrong-selected');
  });
  it('неправильный вариант, который пользователь не выбирал', () => {
    expect(optionStatus(4, [0, 2], [0])).toBe('neutral');
  });
});
