export function selectRandom<T>(items: T[], n: number, rng: () => number = Math.random): T[] {
  const pool = [...items];
  const count = Math.min(n, pool.length);
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}
