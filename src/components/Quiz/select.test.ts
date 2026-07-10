import {describe, it, expect} from 'vitest';
import {selectRandom} from './select';

const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

describe('selectRandom', () => {
  it('возвращает ровно n элементов', () => {
    expect(selectRandom([1,2,3,4,5], 3, seq([0,0,0])).length).toBe(3);
  });
  it('без повторов', () => {
    const r = selectRandom([1,2,3,4,5], 5, seq([0,0,0,0,0]));
    expect(new Set(r).size).toBe(5);
  });
  it('n больше размера — вернуть все', () => {
    expect(selectRandom([1,2], 20, seq([0,0])).length).toBe(2);
  });
  it('не мутирует вход', () => {
    const src = [1,2,3];
    selectRandom(src, 2, seq([0,0]));
    expect(src).toEqual([1,2,3]);
  });
});
