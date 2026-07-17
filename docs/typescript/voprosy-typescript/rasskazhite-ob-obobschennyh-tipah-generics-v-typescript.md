---
id: rasskazhite-ob-obobschennyh-tipah-generics-v-typescript
title: "Обобщённые типы generics в TypeScript"
sidebar_position: 2
tags: ["Собеседование по TypeScript"]
---

# Расскажите об обобщённых типах (generics) в TypeScript.

**Коротко:** Generics — это параметризация типов, позволяющая писать функции, классы и интерфейсы, которые работают с разными типами данных, сохраняя при этом информацию о конкретном типе и типобезопасность, вместо использования `any`.

## Развёрнутый ответ

Обобщённые типы (generics) решают проблему повторного использования кода без потери типовой информации. Без generics разработчик вынужден либо дублировать код под каждый конкретный тип, либо использовать `any`, теряя все преимущества статической проверки типов. Generic-параметр — это как бы «переменная типа», которая подставляется при вызове функции, создании экземпляра класса или использовании интерфейса, и TypeScript выводит (infers) или требует явно указать конкретный тип.

Ключевые области применения generics:

- **Функции.** `function identity<T>(arg: T): T { return arg; }` — тип возвращаемого значения совпадает с типом аргумента, что не работает с `any`.
- **Интерфейсы и типы.** `interface Box<T> { value: T }` — можно создавать `Box<number>`, `Box<string>` и т.д.
- **Классы.** Обобщённые классы, например собственная реализация `Stack<T>` или `LinkedList<T>`.
- **Ограничения (constraints).** С помощью `extends` можно ограничить, какие типы допустимы: `function getLength<T extends { length: number }>(arg: T): number`.
- **Значения по умолчанию.** `interface ApiResponse<T = unknown> { data: T }`.
- **Множественные параметры.** `function merge<T, U>(a: T, b: U): T & U`.
- **Условные и mapped-типы** часто строятся поверх generics: `type Partial<T> = { [P in keyof T]?: T[P] }`, `type NonNullable<T> = T extends null | undefined ? never : T`.

Важное отличие generics от `any`: `any` отключает проверку типов полностью, а generic-параметр сохраняет связь между входным и выходным типом — компилятор «помнит», что было передано, и типизирует соответствующим образом всё, что зависит от этого параметра. Именно поэтому generics называют «полиморфизмом типов» (parametric polymorphism) — код остаётся типобезопасным при любой конкретной подстановке.

TypeScript умеет выводить generic-параметры автоматически из переданных аргументов (type inference), поэтому в большинстве случаев не нужно указывать их явно в угловых скобках при вызове — компилятор сам определит `T` по типу аргумента.

## Пример / когда применяется

```ts
// Обобщённая функция с выводом типа
function identity<T>(arg: T): T {
  return arg;
}
const a = identity("hello"); // T выведен как string
const b = identity(42); // T выведен как number

// Обобщённый интерфейс с ограничением
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

// Обобщённый класс
class Repository<T extends HasId> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getById(id: number): T | undefined {
    return findById(this.items, id);
  }
}

interface User extends HasId {
  name: string;
}

const userRepo = new Repository<User>();
userRepo.add({ id: 1, name: "Alice" });
```

Generics используются практически во всех типовых утилитах TypeScript (`Array<T>`, `Promise<T>`, `Record<K, V>`, `Partial<T>`), в React-компонентах (`useState<T>`), в ORM и HTTP-клиентах для типизации ответов API.

## На что смотрит интервьюер

- Понимание разницы между generics и `any`/`unknown` — ключевой маркер уровня.
- Умение объяснить `extends` как ограничение (constraint), а не как наследование в классическом ООП-смысле.
- Знание вывода типов (type inference) и того, когда TypeScript не может вывести тип и требуется явное указание `<T>`.
- Частые ошибки: использование generic-параметра, который нигде не встречается в сигнатуре (бессмысленный generic); путаница между `T extends U` в generics и в условных типах.
- Follow-up вопросы: mapped types, conditional types, `keyof`, встроенные utility types (`Partial`, `Pick`, `Omit`, `Record`).
