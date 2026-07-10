---
id: kakie-osnovnye-klassy-ispolzuyutsya-v-playwright-java-playwr
title: "Основные классы Playwright для Java"
sidebar_position: 5
tags: ["Playwright"]
---

# Какие основные классы используются в Playwright Java (`Playwright`, `Browser`, `BrowserContext`, `Page`)?

**Коротко:** Иерархия Playwright Java строится сверху вниз: `Playwright` (точка входа и доступ к движкам) создаёт `Browser` (запущенный процесс браузера), из которого получают изолированные `BrowserContext` (аналог профиля/инкогнито-сессии), а внутри контекста открываются `Page` (вкладки), с которыми и происходит основное взаимодействие.

## Развёрнутый ответ

**`Playwright`** — корневой объект, который создаётся через статический метод `Playwright.create()`. Он даёт доступ к трём типам браузеров через свойства `.chromium()`, `.firefox()`, `.webkit()`, каждый из которых возвращает объект типа `BrowserType`, у которого можно вызвать `.launch()` для запуска реального процесса браузера. Объект `Playwright` должен быть закрыт (`playwright.close()`) по завершении работы, обычно через try-with-resources, так как он держит открытым соединение с драйверным процессом Node.js, который управляет браузерами под капотом.

**`Browser`** — представляет запущенный экземпляр браузерного движка (Chromium/Firefox/WebKit). Получается вызовом `browserType.launch(options)`, где можно указать `headless`, `slowMo`, `args` и другие параметры запуска. Один `Browser` может порождать множество независимых `BrowserContext`, что позволяет параллельно и изолированно тестировать разные сценарии в рамках одного процесса браузера, экономя ресурсы по сравнению с запуском нескольких браузеров.

**`BrowserContext`** — изолированная "сессия" внутри браузера, аналогичная отдельному профилю или окну в режиме инкогнито. У каждого контекста собственные куки, localStorage, sessionStorage, кэш и разрешения (geolocation, permissions). Создаётся через `browser.newContext(options)`, где можно настроить viewport, locale, timezone, аутентификацию (`storageState`), запись видео и другие параметры на уровне сессии. Именно `BrowserContext` — основной механизм изоляции между тестами в Playwright.

**`Page`** — представляет одну вкладку (или всплывающее окно) внутри `BrowserContext`. Создаётся через `context.newPage()`. Именно через `Page` выполняется вся практическая работа: навигация (`page.navigate(url)`), поиск элементов (`page.locator(...)`), взаимодействия (`click`, `fill`, `press`), ожидания, работа с диалогами, скриншоты и т.д. Один контекст может содержать несколько страниц одновременно (например, для тестирования открытия ссылок в новой вкладке).

Иерархия вложенности: **один `Playwright` → несколько `Browser` (обычно один на движок) → несколько `BrowserContext` на каждый `Browser` → несколько `Page` на каждый `BrowserContext`.**

## Пример / когда применяется

```java
try (Playwright playwright = Playwright.create()) {
    Browser browser = playwright.chromium().launch(
        new BrowserType.LaunchOptions().setHeadless(true));

    BrowserContext context = browser.newContext();
    Page page = context.newPage();

    page.navigate("https://example.com");
    page.locator("button#submit").click();

    context.close();
    browser.close();
}
```

Практический смысл разделения: в CI можно запустить один `Browser`, но для каждого теста создавать отдельный `BrowserContext` — это дешевле, чем перезапускать весь браузер, и при этом гарантирует полную изоляцию куки/сессий между тестами.

## На что смотрит интервьюер

- Знание правильной иерархии: `Playwright` → `Browser` → `BrowserContext` → `Page`, а не перепутанный порядок.
- Понимание, зачем нужен каждый уровень, а не просто перечисление имён классов.
- Умение объяснить, почему `BrowserContext` — не то же самое, что `Browser`, и почему это важно для изоляции тестов.
- Follow-up: "Может ли один `BrowserContext` содержать несколько `Page`?" (да, например, при открытии ссылок в новых вкладках).
- Красный флаг — путаница между `Browser` и `BrowserContext`, будто это одно и то же.
