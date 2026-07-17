---
id: kak-v-typescript-proveryat-znacheniya-na-ravenstvo-null
title: "Проверка на null и undefined в TypeScript"
sidebar_position: 4
tags: ["Собеседование по TypeScript"]
---

# Как в TypeScript проверять значения на равенство null и undefined?

**Коротко:** Используются строгое сравнение `=== null` / `=== undefined`, нестрогое сравнение `== null` (ловит сразу оба значения), а также специальные операторы TypeScript/JS — optional chaining (`?.`), nullish coalescing (`??`) и non-null assertion (`!`) — в сочетании с включённым режимом `strictNullChecks`.

## Развёрнутый ответ

В обычном JavaScript `null` и `undefined` — это два разных примитивных значения, но при нестрогом сравнении (`==`) они равны друг другу и не равны ничему больше. TypeScript не меняет семантику самого сравнения в рантайме, но добавляет статический контроль над тем, где эти значения допустимы, через флаг `strictNullChecks` (часть `strict`).

Способы проверки:

- **Строгое равенство:** `value === null`, `value === undefined` — проверяет ровно одно из значений.
- **Нестрогое равенство с null:** `value == null` — это единственный «безопасный» случай использования `==`, эквивалентный `value === null || value === undefined`, потому что `null == undefined` истинно, а с любыми другими значениями (`0`, `""`, `false`, `NaN`) сравнение с `null` через `==` даёт `false`.
- **`typeof value === "undefined"`** — используется, если переменная может быть не объявлена вовсе (обращение к необъявленной переменной через `===` бросит `ReferenceError`, а `typeof` — нет).
- **Optional chaining `?.`** — безопасный доступ к вложенным свойствам/методам: `obj?.prop?.method?.()`, возвращает `undefined`, если любое звено цепочки равно `null`/`undefined`, вместо выброса исключения.
- **Nullish coalescing `??`** — подстановка значения по умолчанию только если левый операнд `null` или `undefined` (в отличие от `||`, который сработает и на `0`, `""`, `false`).
- **Non-null assertion `!`** — `value!.prop` говорит компилятору «я гарантирую, что значение не null/undefined», отключая проверку для этого выражения. Это компилируемая подсказка только для TypeScript, в рантайме проверки нет, и при ошибке разработчика будет исключение `Cannot read properties of null/undefined`.
- **Type guards / user-defined type guards:** `if (value !== undefined) { ... }` внутри блока TypeScript сужает (narrows) тип, убирая `null`/`undefined` из объединения.

При включённом `strictNullChecks` компилятор требует явно включать `null`/`undefined` в тип переменной (`string | null`), и без соответствующей проверки обращение к свойствам такой переменной вызовет ошибку компиляции. Без этого флага (устаревшее нестрогое поведение) `null` и `undefined` являются допустимыми значениями для любого типа, что снижает надёжность и не рекомендуется в новых проектах.

## Пример / когда применяется

```ts
interface User {
  name: string;
  address?: {
    city: string;
  };
}

function printCity(user: User) {
  // Optional chaining + nullish coalescing
  const city = user.address?.city ?? "город не указан";
  console.log(city);
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const values: (number | null | undefined)[] = [1, null, 2, undefined, 3];
const filtered: number[] = values.filter(isPresent);
console.log(filtered); // [1, 2, 3]
```

## На что смотрит интервьюер

- Понимание разницы между `==` и `===` при сравнении с `null`, и почему `value == null` — единственный безопасный кейс для `==`.
- Знание отличия `??` от `||` (важный нюанс с falsy-значениями типа `0` и `""`).
- Понимание, что происходит при включённом/выключенном `strictNullChecks`.
- Осторожное отношение к non-null assertion `!` — интервьюер ожидает услышать, что это «обещание компилятору», которое ничем не подкреплено в рантайме, и злоупотребление им опасно.
- Follow-up: type guards, discriminated unions, разница между `unknown` и `any` в контексте null-safety.
