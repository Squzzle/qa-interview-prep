---
id: chto-takoe-vneshnie-obyavleniya-peremennyh-ambient-declarati
title: "Ambient declarations в TypeScript"
sidebar_position: 19
tags: ["Собеседование по TypeScript"]
---

# Что такое внешние объявления переменных (ambient declarations) в TypeScript и когда их нужно использовать?

**Коротко:** Ambient declarations (внешние/декларативные объявления) — это способ описать типы для кода, чья реализация находится вне видимости компилятора TypeScript (глобальные переменные из сторонних скриптов, JS-библиотеки без типов, нестандартные модули); они пишутся через `declare` и обычно выносятся в отдельные `.d.ts` файлы.

## Развёрнутый ответ

Ambient declaration — это объявление, которое сообщает компилятору "эта сущность существует в рантайме, вот её тип, но я не даю реализацию — она придёт откуда-то ещё". Термин "ambient" (внешний, окружающий) подчёркивает, что описываемая сущность существует в окружении программы, а не создаётся самим TS-кодом.

Когда используются ambient declarations:

1. **Подключение JS-библиотек без встроенных типов.** Если библиотека написана на чистом JS и не имеет типов, разработчик пишет `.d.ts` файл с `declare module 'library-name' { ... }`, описывающий её публичный API. Именно так устроено большинство пакетов `@types/*` в DefinitelyTyped.
2. **Глобальные переменные окружения выполнения.** Например, тип `process` в Node.js или `window` в браузере — это ambient declarations, поставляемые пакетами `@types/node` и стандартной библиотекой `lib.dom.d.ts`.
3. **Переменные, инжектируемые сборщиком или средой на этапе сборки.** Например, `declare const __VERSION__: string;` для переменной, подставляемой Webpack/Vite через `DefinePlugin`/`define`, физически не существующей в исходном коде до сборки.
4. **Нестандартные типы импортов** — например, файлы стилей, изображений, `.graphql`, обрабатываемые бандлером: `declare module "*.png" { const src: string; export default src; }`.
5. **Описание legacy-глобальных библиотек** (jQuery, Lodash, подключаемых через `<script>` тег без модульной системы) — через `declare namespace` или `declare var`.

Технически ambient declarations пишутся в **declaration files** (`.d.ts`), которые по умолчанию подключаются компилятором автоматически (если находятся в области видимости проекта, согласно `include`/`typeRoots` в `tsconfig.json`), либо в самих `.ts` файлах через ключевые слова `declare const`/`declare function`/`declare class`/`declare module`/`declare global`/`declare namespace`.

Важное правило: `.d.ts` файл, который не содержит `import`/`export`, автоматически считается глобальным скриптом (ambient script), и всё объявленное в нём становится доступно во всём проекте без импорта. Если же файл содержит `import`/`export`, он становится модулем, и глобальные объявления нужно явно оборачивать в блок `declare global { ... }`.

Ambient declarations не должны использоваться для описания собственного прикладного кода проекта — там типы объявляются обычным образом рядом с реализацией; их применение оправдано именно на границе с внешним/непрозрачным для компилятора миром.

## Пример / когда применяется

```ts
// global.d.ts — глобальный ambient-скрипт (без import/export)
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: number;

console.log(__APP_VERSION__); // доступно в любом файле проекта без импорта
```

```ts
// types/my-untyped-lib.d.ts — описание типов для нетипизированной библиотеки
declare module "my-untyped-lib" {
  export interface Options {
    timeout?: number;
  }
  export function init(options?: Options): void;
}
```

```ts
// tsconfig.json — чтобы .d.ts файлы подхватывались компилятором
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

## На что смотрит интервьюер

- Понимает ли кандидат, что ambient declarations не создают рантайм-код, а только описывают контракт для внешней сущности.
- Знает ли отличие ambient-скрипта (`.d.ts` без import/export, глобальная видимость) от модуля с `declare global`.
- Может ли привести реальные примеры: типизация переменных от сборщика (`DefinePlugin`), описание нетипизированных npm-пакетов, `@types/node`.
- Частая ошибка — путать ambient declaration с обычным `interface`/`type`, не понимая, что ambient-объявления именно про связь с внешним, непрозрачным для TS кодом.
- Follow-up: "Как TypeScript находит и подключает .d.ts файлы автоматически?", "Чем отличается global ambient-файл от файла-модуля с declare global?".
