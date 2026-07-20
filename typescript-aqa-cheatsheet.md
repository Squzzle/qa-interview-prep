# TypeScript — шпаргалка для собеседования AQA

Краткий конспект по TypeScript с уклоном в автоматизацию тестирования
(Playwright / WebdriverIO / API-тесты).

---

## 1. Зачем TS в автоматизации

- Ошибки ловятся **до запуска** (компиляция), а не в рантайме теста.
- Автодополнение и безопасный рефакторинг для Page Objects, фикстур, API-клиентов.
- Типы = живая документация контрактов API и тестовых данных.
- TS использует **структурную типизацию** (duck typing): совместимость по форме, а не по имени типа.

---

## 2. Базовые типы

| Тип | Пример |
|---|---|
| Примитивы | `string`, `number`, `boolean`, `bigint`, `symbol`, `null`, `undefined` |
| Массив | `number[]` или `Array<number>` |
| Кортеж (tuple) | `let p: [string, number] = ['id', 1]` |
| Объект | `{ name: string; age?: number }` |
| Функция | `(a: number, b: number) => number` |
| `any` | отключает проверки — избегать |
| `unknown` | безопасный `any`: нельзя использовать без сужения |
| `never` | значение, которого не бывает (throw, бесконечный цикл, невозможная ветка) |
| `void` | функция ничего не возвращает |

**Частый вопрос — `any` vs `unknown`:**
```ts
let a: any;      a.foo();        // ок на компиляции, упадёт в рантайме
let u: unknown;  u.foo();        // ОШИБКА компиляции
if (typeof u === 'string') u.toUpperCase(); // ок после сужения
```

---

## 3. `type` vs `interface`

| | `interface` | `type` |
|---|---|---|
| Объекты/классы | да | да |
| Расширение | `extends` | `&` (пересечение) |
| Слияние деклараций (declaration merging) | да | нет |
| Union / примитивы / кортежи | нет | да (`type Id = string \| number`) |

Практика: `interface` — для объектов и публичных контрактов; `type` — для union, кортежей, утилитных комбинаций.

---

## 4. Union, Intersection, литеральные типы

```ts
type Status = 'passed' | 'failed' | 'skipped';   // литеральный union
type WithId = { id: number };
type Named  = { name: string };
type User = WithId & Named;                       // intersection (оба поля)
```

**Discriminated union** (размеченное объединение) — частый паттерн:
```ts
type Result =
  | { ok: true; value: string }
  | { ok: false; error: string };

function handle(r: Result) {
  if (r.ok) console.log(r.value); // TS сузил до успешной ветки
  else console.log(r.error);
}
```

---

## 5. Сужение типов (type narrowing / type guards)

```ts
typeof x === 'string'        // примитивы
x instanceof Error           // классы
'name' in obj                // наличие свойства
Array.isArray(x)             // массив
x ?? 'default'               // nullish
```

**Пользовательский type guard** (`x is T`):
```ts
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'id' in x;
}
```

---

## 6. Дженерики (Generics)

```ts
function first<T>(arr: T[]): T { return arr[0]; }

// ограничение
function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

**AQA-пример — типизированный API-запрос:**
```ts
async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}
const user = await get<User>('/api/users/1'); // user: User
```

---

## 7. Utility Types (готовые преобразования)

| Утилита | Что делает |
|---|---|
| `Partial<T>` | все поля необязательные |
| `Required<T>` | все поля обязательные |
| `Readonly<T>` | все поля только для чтения |
| `Pick<T, K>` | выбрать поля `K` |
| `Omit<T, K>` | убрать поля `K` |
| `Record<K, V>` | объект `{ [k in K]: V }` |
| `Exclude<U, X>` / `Extract<U, X>` | фильтрация union |
| `NonNullable<T>` | убрать `null`/`undefined` |
| `ReturnType<F>` / `Parameters<F>` | тип возврата / аргументов функции |
| `Awaited<T>` | тип, который резолвит Promise |

```ts
type UserPreview = Pick<User, 'id' | 'name'>;
type UpdateUser  = Partial<Omit<User, 'id'>>;
```

---

## 8. `keyof`, `typeof`, indexed access, `as const`

```ts
type Keys = keyof User;               // 'id' | 'name'
const cfg = { retries: 2, base: '/' };
type Cfg = typeof cfg;                // { retries: number; base: string }
type Retries = Cfg['retries'];        // number (indexed access)

const roles = ['admin', 'qa'] as const; // readonly ['admin','qa']
type Role = typeof roles[number];        // 'admin' | 'qa'
```

---

## 9. Функции

```ts
function log(msg: string, level: 'info' | 'warn' = 'info'): void {}
function sum(...nums: number[]): number { return nums.reduce((a, b) => a + b, 0); }

// перегрузки
function parse(x: string): object;
function parse(x: number): string;
function parse(x: string | number): object | string { /* ... */ }
```

---

## 10. Классы

```ts
abstract class BasePage {
  protected constructor(protected readonly url: string) {} // parameter property
  abstract open(): Promise<void>;
  static origin = 'https://app.test';
}

class LoginPage extends BasePage implements Openable {
  private user = '';                  // private — только внутри класса
  async open() { /* ... */ }
}
```

- Модификаторы: `public` (по умолчанию), `private`, `protected`, `readonly`.
- **Декораторы** (`@Step`, `@Given`, Allure/NestJS) — включаются `experimentalDecorators` (или стандарт TS 5.x). Оборачивают методы/классы доп. поведением.

---

## 11. Async / Promise

```ts
async function loadUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
type U = Awaited<ReturnType<typeof loadUser>>; // User
```

---

## 12. Модули

```ts
export const BASE = '/api';          // именованный экспорт
export default class Client {}       // экспорт по умолчанию
import Client, { BASE } from './client';
import type { User } from './types'; // import type — стирается при компиляции
```

---

## 13. `tsconfig.json` — ключевые опции

| Опция | Смысл |
|---|---|
| `strict` | включает все строгие проверки (`noImplicitAny`, `strictNullChecks` и др.) — must have |
| `target` | версия JS на выходе (`ES2022`) |
| `module` | система модулей (`ESNext`, `CommonJS`) |
| `moduleResolution` | как искать модули (`bundler`/`node16`) |
| `esModuleInterop` | совместимость `import x from 'cjs'` |
| `types` / `paths` | глобальные типы и алиасы путей |
| `sourceMap` | карты для отладки |

---

## 14. `enum` vs `const object`

```ts
enum Status { Passed, Failed }        // генерирует объект в рантайме
// Современная альтернатива (легче, tree-shakeable):
const Status = { Passed: 'passed', Failed: 'failed' } as const;
type Status = typeof Status[keyof typeof Status]; // 'passed' | 'failed'
```
На собеседовании отметь: `const enum` инлайнится, но конфликтует с изоляцией модулей; часто предпочитают union литералов.

---

## 15. AQA-контекст: типизация автотестов

**Page Object:**
```ts
class LoginPage {
  constructor(private page: Page) {}
  readonly emailInput = () => this.page.locator('#email');
  async login(email: string, pass: string): Promise<void> { /* ... */ }
}
```

**Контракт API-ответа + дженерик-клиент:**
```ts
interface ApiResponse<T> { data: T; status: number; }
interface Order { id: number; total: number; items: string[]; }
const res = await get<ApiResponse<Order>>('/orders/1');
res.data.total; // number
```

**Playwright-фикстура с типами:**
```ts
type Fixtures = { loginPage: LoginPage };
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
});
```

---

## 16. Частые вопросы (коротко)

- **`any` vs `unknown`?** `unknown` требует сузить тип перед использованием — безопаснее.
- **`type` vs `interface`?** `interface` — объекты/контракты и merging; `type` — union, кортежи, утилиты.
- **Как типизировать ответ API?** `interface` на форму + дженерик-функция `get<T>()`.
- **Что такое дженерики?** Параметризация типом для переиспользуемого кода без потери типобезопасности.
- **Structural typing?** Совместимость по форме объекта, не по имени типа.
- **Когда возникает `never`?** Функция всегда бросает/не возвращается; невозможная ветка `switch`.
- **`strictNullChecks`?** `null`/`undefined` не входят в другие типы без явного указания.
- **Optional chaining / nullish?** `a?.b?.c` безопасный доступ; `a ?? b` значение по умолчанию только для `null`/`undefined`.
- **`readonly` vs `const`?** `const` — переменная не переприсваивается; `readonly` — поле не мутируется.
- **Как включить строгую проверку?** `"strict": true` в `tsconfig.json`.
