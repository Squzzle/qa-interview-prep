---
id: chto-takoe-playwright-test-runner-v-chem-ego
title: "Playwright Test Runner и его преимущества"
sidebar_position: 4
tags: ["Playwright"]
---

# Что такое Playwright Test Runner? В чем его преимущество перед использованием JUnit/TestNG для E2E-тестов?

**Коротко:** Playwright Test Runner — это встроенный тест-раннер (`@playwright/test`), заточенный специально под браузерную автоматизацию: он даёт автоматическую параллелизацию, изоляцию через фикстуры, встроенные ретраи, трейсинг, скриншоты/видео на упавших тестах и генерацию отчётов "из коробки" — то, что в связке JUnit/TestNG + Playwright нужно настраивать вручную.

## Развёрнутый ответ

Playwright Test — это отдельный пакет (в JS/TS экосистеме `@playwright/test`), который предоставляет полноценный тест-раннер поверх библиотеки Playwright. В Java-мире у Playwright нет собственного раннера — там используется связка "чистого" Playwright API с JUnit 5 или TestNG, и часть возможностей (авто-фикстуры, встроенные ретраи, трейс-вьювер) приходится реализовывать самостоятельно через хуки жизненного цикла (`@BeforeEach`/`@AfterEach`).

Ключевые преимущества `@playwright/test` перед "голым" JUnit/TestNG:

- **Фикстуры (fixtures).** Каждый тест автоматически получает изолированные `browser`, `context`, `page` через систему фикстур с dependency injection — не нужно вручную писать boilerplate по созданию/закрытию браузера в `@BeforeEach`/`@AfterEach`.
- **Параллелизация из коробки.** Тесты по умолчанию выполняются параллельно в нескольких воркерах (worker processes), с изоляцией состояния между файлами тестов, без дополнительной настройки как в TestNG (`parallel="methods"`, thread-safety WebDriver-инстансов).
- **Встроенные ретраи (retries).** Флаг `retries` в конфиге автоматически перезапускает упавшие тесты заданное число раз — полезно для борьбы с редкой нестабильностью в CI, без сторонних библиотек типа `RetryAnalyzer` в TestNG.
- **Трейсинг и артефакты.** Настройка `trace: 'on-first-retry'`, `screenshot`, `video` автоматически сохраняет полную трассировку выполнения (DOM snapshots, сеть, консоль) для последующего анализа в Trace Viewer — в JUnit это нужно собирать вручную через слушатели (Listeners).
- **Test annotations и организация.** `test.describe`, `test.skip`, `test.only`, `test.step()` дают удобную группировку и детализацию отчётов о шагах внутри теста.
- **Web-first assertions.** Встроенные ассершены (`expect(locator).toBeVisible()`) сами повторяют проверку с поллингом до таймаута, что убирает необходимость в ручных ретраях проверок.
- **Параллельные проекты (projects).** Конфигурация `playwright.config.ts` позволяет один и тот же набор тестов запускать на разных браузерах/устройствах одновременно как отдельные "проекты" без дублирования кода.
- **Встроенный HTML-репортер** и интеграции с CI (JUnit XML, Allure через плагины) без дополнительной настройки отчётности.

При использовании Playwright с JUnit/TestNG (актуально для Java) разработчику приходится самостоятельно реализовывать: управление жизненным циклом браузера/контекста через хуки, параллелизацию через конфигурацию раннера, скриншоты при падении через `TestWatcher`/`ITestListener`, и интеграцию с Allure или другими отчётами вручную.

## Пример / когда применяется

Пример конфигурации `@playwright/test` с параллелизацией, ретраями и трейсингом:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 4,
  retries: 2,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

Пример теста с фикстурой `page` и web-first ассершеном:

```typescript
import { test, expect } from '@playwright/test';

test('пользователь видит заголовок', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

## На что смотрит интервьюер

- Понимание, что Playwright Test — это отдельный тест-раннер, а не просто библиотека автоматизации браузера.
- Знание конкретных "фич из коробки": фикстуры, параллелизация, ретраи, трейсинг, web-first assertions.
- Способность сравнить это с тем, что приходится настраивать вручную при связке "чистый" Playwright API + JUnit/TestNG (актуально для Java-стека).
- Follow-up: "Как работает `trace: 'on-first-retry'`?", "Чем `test.step()` полезен для отчётности?".
- Красный флаг — если кандидат не может назвать ни одной конкретной возможности раннера, кроме общего "он удобнее".
