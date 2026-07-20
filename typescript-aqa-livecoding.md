# Лайвкодинг для AQA на TypeScript — популярные задачи

Подборка самых частых задач лайвкодинга, которые дают автоматизаторам (AQA / SDET)
на собеседованиях с TypeScript/JavaScript. Собрано из открытых источников
(см. [ссылки](#источники) внизу) и сгруппировано по темам.

У каждой задачи есть **Условие** — сначала попробуй решить сам, потом раскрой блок
**«Показать решение»** для проверки. Спутник [шпаргалки](./typescript-aqa-cheatsheet.md).

**Сложность:** 🟢 easy · 🟡 medium · 🔴 hard

## Содержание
1. [Строки и массивы](#1-строки-и-массивы)
2. [Асинхронность и промисы](#2-асинхронность-и-промисы)
3. [Структуры данных и ООП](#3-структуры-данных-и-ооп)
4. [Практика автоматизации (AQA)](#4-практика-автоматизации-aqa)
5. [Классические алгоритмы](#5-классические-алгоритмы)

> **Совет на собеседовании:** проговаривай ход мысли, уточняй вход/выход и краевые
> случаи (пустой ввод, `null`, дубликаты), оценивай сложность (Big O) и предлагай
> тесты. Часто интервьюеру важнее рассуждение, чем идеальный код с первого раза.

---

## 1. Строки и массивы

### 1.1 Разворот строки 🟢
**Условие:** Дана строка `s`. Вернуть новую строку с символами в обратном порядке. Часто просят реализовать без встроенного `.reverse()` (или объяснить, как он работает).

<details>
<summary>Показать решение</summary>

```ts
function reverseString(s: string): string {
  let result = '';
  for (let i = s.length - 1; i >= 0; i--) result += s[i];
  return result;
}
// коротко: const reverseString = (s: string) => s.split('').reverse().join('');
```
</details>

### 1.2 Проверка палиндрома 🟢
**Условие:** Дана строка `s`. Определить, является ли она палиндромом (читается одинаково слева направо и справа налево), игнорируя регистр и небуквенные символы. Вернуть `boolean`.

<details>
<summary>Показать решение</summary>

```ts
function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
  let l = 0, r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++; r--;
  }
  return true;
}
```
</details>

### 1.3 Проверка анаграмм 🟢
**Условие:** Даны две строки `s1` и `s2`. Определить, являются ли они анаграммами друг друга (состоят из одинакового набора символов с одинаковой частотой, порядок не важен). Вернуть `boolean`.

<details>
<summary>Показать решение</summary>

```ts
function isAnagram(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, '');
  a = norm(a); b = norm(b);
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const ch of a) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  for (const ch of b) {
    const c = counts.get(ch);
    if (!c) return false;
    counts.set(ch, c - 1);
  }
  return true;
}
```
</details>

### 1.4 FizzBuzz 🟢
**Условие:** Дано число `n`. Вернуть массив строк для чисел от 1 до n: кратные 3 → `Fizz`, кратные 5 → `Buzz`, кратные 15 → `FizzBuzz`, иначе — само число.

<details>
<summary>Показать решение</summary>

```ts
function fizzBuzz(n: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(String(i));
  }
  return out;
}
```
</details>

### 1.5 Two Sum 🟡
**Условие:** Дан массив чисел `nums` и число `target`. Найти индексы двух элементов, сумма которых равна `target`. Вернуть пару индексов (или `null`, если пары нет). Ожидается оптимизация O(n²) → O(n).

<details>
<summary>Показать решение</summary>

```ts
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement)!, i];
    seen.set(nums[i], i);
  }
  return null;
}
```
</details>

### 1.6 Поиск дубликатов 🟢
**Условие:** Дан массив (чисел или строк). Вернуть массив всех значений, которые встречаются более одного раза (каждое повторяющееся значение — один раз в результате).

<details>
<summary>Показать решение</summary>

```ts
function findDuplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>(), dups = new Set<T>();
  for (const x of arr) (seen.has(x) ? dups : seen).add(x);
  return [...dups];
}
// есть ли дубликаты вообще: new Set(arr).size !== arr.length
```
</details>

### 1.7 Уникальные элементы (в т.ч. по ключу) 🟢
**Условие:** Дан массив. Вернуть новый массив без повторяющихся элементов, сохранив порядок первого появления. Доп. вариант: убрать дубли в массиве объектов по ключу (функция-селектор).

<details>
<summary>Показать решение</summary>

```ts
const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

function uniqueBy<T, K>(arr: T[], keyFn: (x: T) => K): T[] {
  const seen = new Set<K>(), out: T[] = [];
  for (const x of arr) {
    const k = keyFn(x);
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}
```
</details>

### 1.8 Частота символов / слов 🟢
**Условие:** Дана строка (или текст). Вернуть `Map`, где ключ — символ (или слово), а значение — количество его вхождений.

<details>
<summary>Показать решение</summary>

```ts
function charFrequency(s: string): Map<string, number> {
  const f = new Map<string, number>();
  for (const ch of s) f.set(ch, (f.get(ch) ?? 0) + 1);
  return f;
}

function wordFrequency(text: string): Map<string, number> {
  const f = new Map<string, number>();
  for (const w of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    f.set(w, (f.get(w) ?? 0) + 1);
  }
  return f;
}
```
</details>

### 1.9 Flatten произвольно вложенного массива 🟡
**Условие:** Дан массив, элементы которого могут быть примитивами или вложенными массивами произвольной глубины. Вернуть плоский одномерный массив всех элементов в исходном порядке (реализовать без `Array.prototype.flat`).

<details>
<summary>Показать решение</summary>

```ts
function flatten<T>(arr: Array<T | T[]>): T[] {
  const out: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(...flatten(item as Array<T | T[]>));
    else out.push(item);
  }
  return out;
}
// коротко: arr.flat(Infinity)
```
</details>

### 1.10 Group by (группировка по ключу) 🟡
**Условие:** Дан массив объектов и функция-селектор ключа. Сгруппировать элементы в объект, где ключ — результат селектора, а значение — массив элементов с этим ключом.

<details>
<summary>Показать решение</summary>

```ts
function groupBy<T, K extends string | number>(
  arr: T[], keyFn: (x: T) => K,
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
```
</details>

### 1.11 Min/Max за один проход 🟢
**Условие:** Дан массив чисел. Найти минимальное и максимальное значение за один проход, без `Math.max(...arr)` (обсудить, почему spread ломается на очень больших массивах).

<details>
<summary>Показать решение</summary>

```ts
function minMax(arr: number[]): { min: number; max: number } {
  if (!arr.length) throw new Error('empty');
  let min = arr[0], max = arr[0];
  for (const n of arr) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return { min, max };
}
```
</details>

### 1.12 Самый частый элемент 🟡
**Условие:** Дан массив элементов. Вернуть элемент, встречающийся чаще всех (при равенстве — любой из них).

<details>
<summary>Показать решение</summary>

```ts
function mostFrequent<T>(arr: T[]): T {
  if (!arr.length) throw new Error('empty');
  const f = new Map<T, number>();
  let best = arr[0], bestCount = 0;
  for (const x of arr) {
    const c = (f.get(x) ?? 0) + 1;
    f.set(x, c);
    if (c > bestCount) { bestCount = c; best = x; }
  }
  return best;
}
```
</details>

### 1.13 Сбалансированность скобок (стек) 🟡
**Условие:** Дана строка, содержащая символы `(){}[]`. Определить, сбалансированы ли скобки: каждой открывающей соответствует закрывающая того же типа в правильном порядке. Использовать стек. (LeetCode 20)

<details>
<summary>Показать решение</summary>

```ts
function isValidParentheses(s: string): boolean {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (ch in pairs && stack.pop() !== pairs[ch]) return false;
  }
  return stack.length === 0;
}
```
</details>

---

## 2. Асинхронность и промисы

> Самый «AQA-специфичный» блок: ожидания, повторы, борьба с flaky-тестами.

### 2.1 sleep / delay 🟢
**Условие:** Реализовать функцию `sleep(ms)`, возвращающую `Promise`, который резолвится через `ms` миллисекунд. Опционально — `delay(ms, value)`, резолвящийся переданным значением. (Базовый блок для остальных задач раздела.)

<details>
<summary>Показать решение</summary>

```ts
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function delay<T>(ms: number, value?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
}
```
</details>

### 2.2 retry (повтор при ошибке) 🟢
**Условие:** Написать `retry(fn, retries, delayMs)`: вызвать асинхронную `fn`; если она бросает исключение — повторять до `retries` раз с паузой `delayMs` между попытками. После исчерпания попыток — пробросить последнюю ошибку.

<details>
<summary>Показать решение</summary>

```ts
async function retry<T>(fn: () => Promise<T>, retries: number, delayMs = 0): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries && delayMs > 0) await sleep(delayMs);
    }
  }
  throw lastError;
}
```
</details>

### 2.3 retry с экспоненциальным backoff 🟡
**Условие:** Расширить `retry` так, чтобы задержка между попытками росла экспоненциально (`baseDelay * 2^attempt`), с опциональным `jitter` (случайным разбросом) и ограничением `maxDelay`. Актуально для flaky UI/API.

<details>
<summary>Показать решение</summary>

```ts
interface RetryOptions { retries: number; baseDelay: number; maxDelay?: number; jitter?: boolean; }

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  { retries, baseDelay, maxDelay = Infinity, jitter = true }: RetryOptions,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      let d = Math.min(baseDelay * 2 ** attempt, maxDelay);
      if (jitter) d = Math.random() * d;
      await sleep(d);
    }
  }
  throw lastError;
}
```
</details>

### 2.4 waitFor / poll (ожидание условия) 🟡
**Условие:** Реализовать `waitFor(predicate, { timeout, interval })`: периодически (раз в `interval` мс) вызывать асинхронный `predicate`, пока тот не вернёт truthy-значение; если за `timeout` мс условие не выполнилось — бросить `TimeoutError`. (Аналог `browser.waitUntil` / `expect.poll`.)

<details>
<summary>Показать решение</summary>

```ts
class TimeoutError extends Error {}

async function waitFor<T>(
  predicate: () => T | Promise<T>,
  { timeout = 5000, interval = 100 }: { timeout?: number; interval?: number } = {},
): Promise<T> {
  const start = Date.now();
  while (true) {
    const result = await predicate();
    if (result) return result;
    if (Date.now() - start >= timeout) {
      throw new TimeoutError(`condition not met within ${timeout}ms`);
    }
    await sleep(interval);
  }
}
```
</details>

### 2.5 timeout-обёртка над промисом 🟢
**Условие:** Реализовать `withTimeout(promise, ms, message?)`: вернуть результат исходного промиса, если он успел завершиться за `ms` мс, иначе — реджектнуть ошибкой таймаута. Не забыть очистить таймер (проверяют понимание `Promise.race`).

<details>
<summary>Показать решение</summary>

```ts
function withTimeout<T>(promise: Promise<T>, ms: number, message = 'Timeout'): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}
```
</details>

### 2.6 Своя реализация Promise.all 🟡
**Условие:** Реализовать `myPromiseAll(promises)` без встроенного `Promise.all`: резолвится массивом значений в исходном порядке, когда все промисы успешны; реджектится причиной первого упавшего.

<details>
<summary>Показать решение</summary>

```ts
function myPromiseAll<T>(promises: Array<T | Promise<T>>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results: T[] = new Array(promises.length);
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}
```
</details>

### 2.7 Своя реализация Promise.allSettled 🟡
**Условие:** Реализовать `myAllSettled(promises)`: вернуть массив объектов `{status:'fulfilled', value}` или `{status:'rejected', reason}` для каждого промиса в исходном порядке, независимо от того, упали ли какие-то из них.

<details>
<summary>Показать решение</summary>

```ts
type Settled<T> = { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown };

function myAllSettled<T>(promises: Array<T | Promise<T>>): Promise<Settled<T>[]> {
  return new Promise((resolve) => {
    if (promises.length === 0) return resolve([]);
    const results: Settled<T>[] = new Array(promises.length);
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => { results[i] = { status: 'fulfilled', value }; if (--remaining === 0) resolve(results); },
        (reason) => { results[i] = { status: 'rejected', reason }; if (--remaining === 0) resolve(results); },
      );
    });
  });
}
```
</details>

### 2.8 Последовательное vs параллельное выполнение 🟢
**Условие:** Дан массив асинхронных задач (функций, возвращающих `Promise`). Написать `runSequential` (выполняет по очереди, дожидаясь каждой) и `runParallel` (запускает все сразу), собирая результаты. Объяснить разницу по времени и по поведению при ошибках.

<details>
<summary>Показать решение</summary>

```ts
async function runSequential<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  const out: T[] = [];
  for (const task of tasks) out.push(await task()); // ждём каждую перед следующей
  return out;
}

const runParallel = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> =>
  Promise.all(tasks.map((t) => t())); // все стартуют сразу
```
</details>

### 2.9 Пул промисов с ограничением параллелизма 🔴
**Условие:** Реализовать `promisePool(tasks, limit)`: выполнить массив асинхронных задач так, чтобы одновременно выполнялось не более `limit` штук, возвращая результаты в исходном порядке.

<details>
<summary>Показать решение</summary>

```ts
async function promisePool<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}
```
</details>

### 2.10 debounce 🟢
**Условие:** Реализовать `debounce(fn, wait)`: вернуть обёртку, которая откладывает вызов `fn` до тех пор, пока не пройдёт `wait` мс без новых вызовов; каждый новый вызов сбрасывает таймер. Сохранить `this` и аргументы последнего вызова.

<details>
<summary>Показать решение</summary>

```ts
function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return function (this: unknown, ...args: A) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
```
</details>

### 2.11 throttle (leading + trailing) 🟡
**Условие:** Реализовать `throttle(fn, limit)`: `fn` вызывается не чаще одного раза за `limit` мс, сколько бы раз ни вызвали обёртку; последний вызов в «окне блокировки» выполняется как trailing call с последними аргументами.

<details>
<summary>Показать решение</summary>

```ts
function throttle<A extends unknown[]>(fn: (...args: A) => void, limit: number) {
  let inThrottle = false;
  let trailing: A | null = null;
  const invoke = (args: A) => {
    fn(...args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
      if (trailing) { const a = trailing; trailing = null; invoke(a); }
    }, limit);
  };
  return (...args: A) => { inThrottle ? (trailing = args) : invoke(args); };
}
```
</details>

---

## 3. Структуры данных и ООП

### 3.1 Stack (стек) 🟢
**Условие:** Реализовать generic-класс `Stack<T>` с методами `push` (добавить), `pop` (удалить и вернуть верхний), `peek` (посмотреть верхний без удаления), `isEmpty`, `size`.

<details>
<summary>Показать решение</summary>

```ts
class Stack<T> {
  private items: T[] = [];
  push(x: T): void { this.items.push(x); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  isEmpty(): boolean { return this.items.length === 0; }
  size(): number { return this.items.length; }
}
```
</details>

### 3.2 Queue (очередь) с O(1) dequeue 🟢
**Условие:** Реализовать generic-класс `Queue<T>` с методами `enqueue` (в конец), `dequeue` (из начала), `isEmpty`, `size`. Обсудить, почему наивный `array.shift()` даёт O(n), и как сделать `dequeue` за O(1).

<details>
<summary>Показать решение</summary>

```ts
class Queue<T> {
  private items: Record<number, T> = {};
  private head = 0;
  private tail = 0;
  enqueue(x: T): void { this.items[this.tail++] = x; }
  dequeue(): T | undefined {
    if (this.head === this.tail) return undefined;
    const x = this.items[this.head];
    delete this.items[this.head++];
    return x;
  }
  isEmpty(): boolean { return this.head === this.tail; }
  size(): number { return this.tail - this.head; }
}
```
</details>

### 3.3 Очередь через два стека 🟡
**Условие:** Реализовать очередь (`enqueue`/`dequeue`), используя внутри только два стека (без прямого доступа к элементам по индексу). Обсудить амортизированную сложность O(1).

<details>
<summary>Показать решение</summary>

```ts
class QueueViaStacks<T> {
  private inS: T[] = [];
  private outS: T[] = [];
  enqueue(x: T): void { this.inS.push(x); }
  dequeue(): T | undefined {
    if (!this.outS.length) while (this.inS.length) this.outS.push(this.inS.pop()!);
    return this.outS.pop();
  }
  isEmpty(): boolean { return !this.inS.length && !this.outS.length; }
}
```
</details>

### 3.4 Односвязный список + reverse 🟡
**Условие:** Реализовать односвязный список с методами `append` (добавить в конец), `reverse` (развернуть список на месте) и `toArray`. Часто также просят `prepend` и `delete(value)`.

<details>
<summary>Показать решение</summary>

```ts
class ListNode<T> { next: ListNode<T> | null = null; constructor(public value: T) {} }

class LinkedList<T> {
  head: ListNode<T> | null = null;
  append(v: T): void {
    const node = new ListNode(v);
    if (!this.head) { this.head = node; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
  reverse(): void {
    let prev: ListNode<T> | null = null, cur = this.head;
    while (cur) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }
    this.head = prev;
  }
  toArray(): T[] {
    const out: T[] = [];
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.value);
    return out;
  }
}
```
</details>

### 3.5 Обнаружение цикла в списке 🟡
**Условие:** Дан связный список. Определить, содержит ли он цикл, алгоритмом «черепаха и заяц» (два указателя с разной скоростью) за O(n) времени и O(1) памяти. (LeetCode 141)

<details>
<summary>Показать решение</summary>

```ts
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```
</details>

### 3.6 EventEmitter (Pub/Sub) 🟡
**Условие:** Реализовать класс `EventEmitter` с методами `on(event, handler)` (подписка), `off(event, handler)` (отписка), `once(event, handler)` (одноразовая подписка) и `emit(event, ...args)` (вызвать всех подписчиков события с аргументами).

<details>
<summary>Показать решение</summary>

```ts
type Handler = (...args: unknown[]) => void;

class EventEmitter {
  private listeners = new Map<string, Handler[]>();
  on(event: string, h: Handler): this {
    const arr = this.listeners.get(event) ?? [];
    arr.push(h); this.listeners.set(event, arr); return this;
  }
  off(event: string, h: Handler): this {
    const arr = this.listeners.get(event);
    if (arr) this.listeners.set(event, arr.filter((x) => x !== h));
    return this;
  }
  once(event: string, h: Handler): this {
    const wrap: Handler = (...a) => { this.off(event, wrap); h(...a); };
    return this.on(event, wrap);
  }
  emit(event: string, ...args: unknown[]): boolean {
    const arr = this.listeners.get(event);
    if (!arr?.length) return false;
    [...arr].forEach((h) => h(...args)); // копия — на случай отписки во время emit
    return true;
  }
}
```
</details>

### 3.7 LRU-кэш 🔴
**Условие:** Реализовать `LRUCache<K, V>` с фиксированной `capacity`: `get(key)` возвращает значение и помечает его как недавно использованное; `put(key, value)` добавляет/обновляет, вытесняя наименее недавно использованный элемент при переполнении. Обе операции — O(1). (LeetCode 146)

<details>
<summary>Показать решение</summary>

```ts
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const v = this.cache.get(key)!;
    this.cache.delete(key); this.cache.set(key, v); // в конец = MRU
    return v;
  }
  put(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value as K); // первый = LRU
    }
    this.cache.set(key, value);
  }
}
```
</details>

### 3.8 deepClone (с циклическими ссылками) 🟡
**Условие:** Написать `deepClone<T>(obj)`: полная глубокая копия произвольного объекта/массива, включая вложенные объекты, массивы и `Date`, с корректной обработкой циклических ссылок (без бесконечной рекурсии).

<details>
<summary>Показать решение</summary>

```ts
function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (seen.has(value)) return seen.get(value) as T;

  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    value.forEach((item, i) => { copy[i] = deepClone(item, seen); });
    return copy as unknown as T;
  }
  const copy: Record<string, unknown> = {};
  seen.set(value, copy);
  for (const k of Object.keys(value)) {
    copy[k] = deepClone((value as Record<string, unknown>)[k], seen);
  }
  return copy as T;
}
```
</details>

### 3.9 deepEqual (глубокое сравнение) 🟡
**Условие:** Написать `deepEqual(a, b)`: рекурсивно сравнить два значения (примитивы, массивы, объекты, вложенные структуры) на равенство значений, а не ссылок. Учесть `NaN` и различие массив/объект. (Ежедневная задача при ассертах на API-ответы.)

<details>
<summary>Показать решение</summary>

```ts
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true; // корректно для NaN
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    Object.prototype.hasOwnProperty.call(b, k) &&
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}
```
</details>

### 3.10 deepMerge (глубокое слияние) 🟡
**Условие:** Написать `deepMerge(target, source)`: рекурсивно объединить два объекта — вложенные объекты сливаются рекурсивно, а массивы и примитивы из `source` перезаписывают значения `target`.

<details>
<summary>Показать решение</summary>

```ts
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function deepMerge<T extends Obj, S extends Obj>(target: T, source: S): T & S {
  const out: Obj = { ...target };
  for (const k of Object.keys(source)) {
    out[k] = isObj(source[k]) && isObj(out[k])
      ? deepMerge(out[k] as Obj, source[k] as Obj)
      : source[k];
  }
  return out as T & S;
}
```
</details>

---

## 4. Практика автоматизации (AQA)

### 4.1 Парсинг query-string 🟢
**Условие:** Написать `parseQueryString(query)`: принимает строку вида `?a=1&b=2&b=3&c` (с ведущим `?` или без) и возвращает объект параметров. Повторяющиеся ключи собираются в массив, ключ без значения → пустая строка, значения декодируются через `decodeURIComponent`.

<details>
<summary>Показать решение</summary>

```ts
function parseQueryString(query: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const q = query.startsWith('?') ? query.slice(1) : query;
  if (!q) return out;
  for (const pair of q.split('&')) {
    if (!pair) continue;
    const [rawK, rawV = ''] = pair.split('=');
    const k = decodeURIComponent(rawK.replace(/\+/g, ' '));
    const v = decodeURIComponent(rawV.replace(/\+/g, ' '));
    if (k in out) {
      const ex = out[k];
      out[k] = Array.isArray(ex) ? [...ex, v] : [ex, v];
    } else out[k] = v;
  }
  return out;
}
```
</details>

### 4.2 Сборка query-string из объекта 🟢
**Условие:** Написать `buildQueryString(params)`: сериализовать объект параметров в строку запроса (без ведущего `?`), пропуская `undefined`-значения, кодируя спецсимволы и разворачивая массивы в повторяющиеся ключи (`key=v1&key=v2`).

<details>
<summary>Показать решение</summary>

```ts
function buildQueryString(
  params: Record<string, string | number | boolean | (string | number)[] | undefined>,
): string {
  const parts: string[] = [];
  for (const [k, value] of Object.entries(params)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join('&');
}
```
</details>

### 4.3 Мини-валидатор JSON-схемы 🟡
**Условие:** Реализовать `validateSchema(data, schema)`, где `schema` описывает ожидаемый тип поля (string/number/boolean/object/array), обязательность (`required`) и вложенные `properties`/`items`. Рекурсивно обойти данные и вернуть `{ valid, errors[] }` с путём до проблемного поля (напр. `user.age: expected number, got string`).

<details>
<summary>Показать решение</summary>

```ts
type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array';
interface Schema { type: FieldType; required?: boolean; properties?: Record<string, Schema>; items?: Schema; }

function validateSchema(data: unknown, schema: Schema, path = '$'): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  function check(value: unknown, s: Schema, p: string): void {
    if (value === undefined || value === null) {
      if (s.required !== false) errors.push(`${p}: required field is missing`);
      return;
    }
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (actual !== s.type) { errors.push(`${p}: expected ${s.type}, got ${actual}`); return; }
    if (s.type === 'object' && s.properties) {
      for (const [k, cs] of Object.entries(s.properties)) check((value as Record<string, unknown>)[k], cs, `${p}.${k}`);
    }
    if (s.type === 'array' && s.items) {
      (value as unknown[]).forEach((item, i) => check(item, s.items!, `${p}[${i}]`));
    }
  }
  check(data, schema, path);
  return { valid: errors.length === 0, errors };
}
```
</details>

### 4.4 Type guard + assert для ответа API 🟢
**Условие:** Дан интерфейс `UserResponse { id: number; name: string; email: string }`. Написать type guard `isUserResponse(data): data is UserResponse` и assert-функцию `assertUserResponse(data): asserts data is UserResponse`, бросающую `Error` при несоответствии структуры.

<details>
<summary>Показать решение</summary>

```ts
interface UserResponse { id: number; name: string; email: string; }

function isUserResponse(data: unknown): data is UserResponse {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.id === 'number' && typeof d.name === 'string' && typeof d.email === 'string';
}

function assertUserResponse(data: unknown): asserts data is UserResponse {
  if (!isUserResponse(data)) throw new Error('Invalid UserResponse shape');
}
```
</details>

### 4.5 Фабрика тестовых данных с overrides 🟢
**Условие:** Реализовать фабрику `createUser(overrides?)`, возвращающую объект пользователя со значениями по умолчанию (уникальный `id` через счётчик, сгенерированные `name`/`email`), позволяя переопределить любые поля через `overrides`. Плюс `createUsers(count, overrides?)` для массива.

<details>
<summary>Показать решение</summary>

```ts
interface User { id: number; name: string; email: string; age: number; isActive: boolean; }
let userSeq = 0;

function createUser(overrides: Partial<User> = {}): User {
  const id = ++userSeq;
  return {
    id, name: `Test User ${id}`, email: `user${id}@example.com`,
    age: 18 + (id % 50), isActive: true, ...overrides,
  };
}
const createUsers = (n: number, o: Partial<User> = {}): User[] =>
  Array.from({ length: n }, () => createUser(o));
```
</details>

### 4.6 Детерминированный генератор данных (с сидом) 🟡
**Условие:** Написать детерминированный генератор `createSeededRandom(seed): () => number` (числа в `[0, 1)`) и на его основе `randomString(length, rng): string` из символов `a-z0-9`, чтобы тестовые данные были воспроизводимы при одном и том же сиде.

<details>
<summary>Показать решение</summary>

```ts
function createSeededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => { state = (state * 16807) % 2147483647; return (state - 1) / 2147483646; };
}

function randomString(length: number, rng: () => number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}
```
</details>

### 4.7 Diff двух JSON (список расхождений) 🟡
**Условие:** Написать `jsonDiff(expected, actual, path?)`: рекурсивно сравнить два JSON-объекта/массива и вернуть список человекочитаемых различий вида `path: expected X, got Y`, включая отсутствующие и лишние ключи.

<details>
<summary>Показать решение</summary>

```ts
function jsonDiff(expected: unknown, actual: unknown, path = '$'): string[] {
  const diffs: string[] = [];
  const eObj = expected !== null && typeof expected === 'object';
  const aObj = actual !== null && typeof actual === 'object';
  if (!eObj || !aObj) {
    if (expected !== actual) diffs.push(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    return diffs;
  }
  if (Array.isArray(expected) !== Array.isArray(actual)) { diffs.push(`${path}: type mismatch`); return diffs; }
  const e = expected as Record<string, unknown>, a = actual as Record<string, unknown>;
  for (const k of new Set([...Object.keys(e), ...Object.keys(a)])) {
    if (!(k in e)) diffs.push(`${path}.${k}: unexpected key`);
    else if (!(k in a)) diffs.push(`${path}.${k}: missing key`);
    else diffs.push(...jsonDiff(e[k], a[k], `${path}.${k}`));
  }
  return diffs;
}
```
</details>

### 4.8 waitForCondition (polling с таймаутом) 🟡
**Условие:** Реализовать `waitForCondition(condition, { timeout, interval })`: опрашивать `condition()` с заданным интервалом (по умолчанию 100 мс), пока она не вернёт `true`, либо выбросить понятную ошибку по истечении `timeout` (по умолчанию 5000 мс).

<details>
<summary>Показать решение</summary>

```ts
async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  { timeout = 5000, interval = 100, message = 'Condition not met' } = {},
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, interval));
  }
  if (await condition()) return;
  throw new Error(`${message} (waited ${timeout}ms)`);
}
```
</details>

### 4.9 waitForElement (MutationObserver + fallback) 🟡
**Условие:** Написать `waitForElement(selector, timeout = 5000): Promise<Element>`, который резолвится элементом DOM, как только `document.querySelector(selector)` начинает его находить (через `MutationObserver` или polling), и реджектится по таймауту.

<details>
<summary>Показать решение</summary>

```ts
function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) { observer.disconnect(); clearTimeout(timer); resolve(el); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}
```
</details>

### 4.10 Page Object для формы логина 🟢
**Условие:** Реализовать класс `LoginPage` (Page Object) поверх абстрактного интерфейса `driver` с методами: `open(url)`, `login(user, pass)` (заполнить поля и сабмит), `getError()`. Локаторы должны храниться как приватные константы класса, а не размазываться по тестам.

<details>
<summary>Показать решение</summary>

```ts
interface Driver {
  goto(url: string): Promise<void>;
  type(sel: string, v: string): Promise<void>;
  click(sel: string): Promise<void>;
  getText(sel: string): Promise<string | null>;
}

class LoginPage {
  private readonly sel = { user: '#username', pass: '#password', submit: '#login-submit', error: '.error' } as const;
  constructor(private readonly driver: Driver) {}
  async open(url: string) { await this.driver.goto(url); }
  async login(user: string, pass: string): Promise<void> {
    await this.driver.type(this.sel.user, user);
    await this.driver.type(this.sel.pass, pass);
    await this.driver.click(this.sel.submit);
  }
  getError(): Promise<string | null> { return this.driver.getText(this.sel.error); }
}
```
</details>

### 4.11 Типизированная обёртка над fetch 🟡
**Условие:** Написать `apiRequest<T>(url, options?)`: делает `fetch`, проверяет `response.ok`, при HTTP-ошибке бросает кастомный `ApiError` (с полями `status` и `body`), при успехе парсит и возвращает JSON, типизированный дженериком `T`.

<details>
<summary>Показать решение</summary>

```ts
class ApiError extends Error {
  constructor(public readonly status: number, public readonly body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();
  let body: unknown = text;
  try { body = text ? JSON.parse(text) : undefined; } catch { /* keep raw text */ }
  if (!response.ok) throw new ApiError(response.status, body);
  return body as T;
}
```
</details>

### 4.12 API-клиент с базовым URL и retry на 5xx 🔴
**Условие:** Реализовать класс `ApiClient` с конструктором `(baseUrl)` и методом `get<T>(path, params?)`, который строит query-string, делает запрос с автоматическим повтором (до 3 попыток) при сетевых ошибках или статусах 5xx, используя экспоненциальную задержку между попытками.

<details>
<summary>Показать решение</summary>

```ts
class ApiClient {
  constructor(private readonly baseUrl: string) {}
  async get<T>(path: string, params?: Record<string, string>, maxRetries = 3): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const url = `${this.baseUrl}${path}${query}`;
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url);
        if (res.ok) return (await res.json()) as T;
        if (res.status < 500) throw new Error(`Request failed: ${res.status}`);
        lastError = new Error(`Server error: ${res.status}`);
      } catch (err) { lastError = err; }
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
    }
    throw lastError instanceof Error ? lastError : new Error('Request failed');
  }
}
```
</details>

---

## 5. Классические алгоритмы

### 5.1 N-ное число Фибоначчи (итеративно) 🟢
**Условие:** Дано целое `n ≥ 0`. Вернуть n-ное число последовательности Фибоначчи (F0=0, F1=1, Fn=Fn-1+Fn-2). Без экспоненциальной рекурсии — за O(n) времени и O(1) памяти.

<details>
<summary>Показать решение</summary>

```ts
function fibonacci(n: number): number {
  if (n < 0) throw new Error('n must be >= 0');
  let prev = 0, curr = 1;
  if (n === 0) return 0;
  for (let i = 2; i <= n; i++) { [prev, curr] = [curr, prev + curr]; }
  return curr;
}
```
</details>

### 5.2 Фибоначчи с мемоизацией 🟡
**Условие:** Реализовать рекурсивное вычисление n-го числа Фибоначчи с кэшированием промежуточных результатов (мемоизация), чтобы избежать повторных вычислений и снизить сложность до O(n).

<details>
<summary>Показать решение</summary>

```ts
function fibMemo(n: number, cache = new Map<number, number>()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!;
  const v = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, v);
  return v;
}
```
</details>

### 5.3 Факториал (итеративно и рекурсивно) 🟢
**Условие:** Дано неотрицательное целое `n`. Вернуть `n! = 1·2·…·n` (0! = 1). Показать оба варианта — итеративный и рекурсивный, обсудить риск переполнения стека при больших `n`.

<details>
<summary>Показать решение</summary>

```ts
function factorial(n: number): number {
  if (n < 0) throw new Error('n must be >= 0');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
const factorialRec = (n: number): number => (n <= 1 ? 1 : n * factorialRec(n - 1));
```
</details>

### 5.4 Сумма цифр числа (без строк) 🟢
**Условие:** Дано целое число `n` (может быть отрицательным). Вернуть сумму всех его цифр, не преобразуя число в строку (через деление и остаток от деления на 10).

<details>
<summary>Показать решение</summary>

```ts
function sumOfDigits(n: number): number {
  let num = Math.abs(Math.trunc(n)), sum = 0;
  while (num > 0) { sum += num % 10; num = Math.floor(num / 10); }
  return sum;
}
```
</details>

### 5.5 Проверка числа на простоту 🟢
**Условие:** Дано целое `n`. Вернуть `true`, если число простое (`n > 1`, делится только на 1 и себя), иначе `false`. Оптимизировать перебор делителей до `√n`.

<details>
<summary>Показать решение</summary>

```ts
function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}
```
</details>

### 5.6 Простые числа в диапазоне (решето Эратосфена) 🟡
**Условие:** Даны границы `from` и `to`. Вернуть массив всех простых чисел в этом диапазоне. Обсудить эффективную реализацию через решето Эратосфена для больших диапазонов.

<details>
<summary>Показать решение</summary>

```ts
function primesInRange(from: number, to: number): number[] {
  const limit = Math.max(2, to);
  const sieve = new Array<boolean>(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) for (let j = i * i; j <= limit; j += i) sieve[j] = false;
  }
  const out: number[] = [];
  for (let n = Math.max(2, from); n <= to; n++) if (sieve[n]) out.push(n);
  return out;
}
```
</details>

### 5.7 Наибольший общий делитель (Евклид) 🟢
**Условие:** Даны два целых положительных числа `a` и `b`. Вернуть их наибольший общий делитель, используя алгоритм Евклида (рекурсивно или итеративно).

<details>
<summary>Показать решение</summary>

```ts
function gcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}
```
</details>

### 5.8 Реверс числа (со знаком) 🟢
**Условие:** Дано целое число `n` (может быть отрицательным). Вернуть число с перевёрнутым порядком цифр, сохранив знак (например `-123 → -321`), без преобразования в строку.

<details>
<summary>Показать решение</summary>

```ts
function reverseNumber(n: number): number {
  const sign = Math.sign(n) || 1;
  let num = Math.abs(n), reversed = 0;
  while (num > 0) { reversed = reversed * 10 + (num % 10); num = Math.floor(num / 10); }
  return sign * reversed;
}
```
</details>

### 5.9 Бинарный поиск 🟢
**Условие:** Дан отсортированный по возрастанию массив чисел `arr` и искомое значение `target`. Вернуть индекс `target`, либо `-1`, если элемента нет. Решение за O(log n).

<details>
<summary>Показать решение</summary>

```ts
function binarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
```
</details>

### 5.10 Сортировка пузырьком 🟢
**Условие:** Дан массив чисел. Вернуть новый массив, отсортированный по возрастанию, реализовав алгоритм сортировки вручную (без встроенного `sort`). Обсудить сложность O(n²).

<details>
<summary>Показать решение</summary>

```ts
function bubbleSort(input: number[]): number[] {
  const arr = [...input];
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; swapped = true; }
    }
    if (!swapped) break;
  }
  return arr;
}
```
</details>

### 5.11 Быстрая сортировка 🟡
**Условие:** Дан массив чисел. Отсортировать по возрастанию алгоритмом QuickSort (разделяй-и-властвуй: выбор опорного элемента, разбиение на меньше/больше опорного). Средняя сложность O(n log n).

<details>
<summary>Показать решение</summary>

```ts
function quickSort(input: number[]): number[] {
  if (input.length <= 1) return input;
  const [pivot, ...rest] = input;
  const left = rest.filter((x) => x < pivot);
  const right = rest.filter((x) => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}
```
</details>

### 5.12 Счётчик на замыкании 🟢
**Условие:** Реализовать `createCounter(start?)`, возвращающий объект с методами `increment()`, `decrement()`, `getValue()`, где текущее значение хранится в приватной переменной, доступной только через замыкание (а не как публичное поле).

<details>
<summary>Показать решение</summary>

```ts
function createCounter(start = 0) {
  let value = start;
  return {
    increment: () => ++value,
    decrement: () => --value,
    getValue: () => value,
  };
}
```
</details>

---

## Источники

Задачи и их популярность подтверждены пересечением нескольких открытых подборок
по лайвкодингу для QA/JS в 2024-2025:

- **hirehi.ru** — топ-10 задач лайвкодинга (FizzBuzz, Two Sum, реверс/палиндром, дубликаты, бинарный поиск, скобки).
- **sobes.tech** — банк лайвкодинг-задач для QA Automation (разбор JSON, отложенный Promise, deepEqual, retry).
- **habr.com** — статьи по JS live-coding (напр. `/ru/articles/741108`, `/ru/articles/878594`).
- **purpleschool.ru**, **thecode.media**, **offer.engineerspock.com** — типовые JS-задачи собеседований.
- **TheBugHacker «QA Automation Interview»** — числовые/алгоритмические задачи (Фибоначчи, факториал, простые числа, сортировки).
- **LeetCode** — классика: `#20` Valid Parentheses, `#141` Linked List Cycle, `#146` LRU Cache.

> Формулировки адаптированы, решения написаны заново под TypeScript и проверены
> компилятором. Используйте как тренажёр: сначала решите по условию сами, потом
> раскройте блок с решением для сверки.
