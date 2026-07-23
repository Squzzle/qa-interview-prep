---
id: chto-takoe-electron-based-applications-kak-ispolzovat-seleni
title: "Electron-приложения — тестирование через Selenium/Appium"
sidebar_position: 7
tags: ["AQA — Selenium"]
---

# Что такое Electron-based applications? Как использовать Selenium и Appium для их тестирования?

**Коротко:** Electron — фреймворк для создания кросс-платформенных десктопных приложений на веб-технологиях (HTML/CSS/JS), объединяющий движок Chromium (для UI) и Node.js (для доступа к системным API); поскольку UI построен на Chromium, его можно автоматизировать через ChromeDriver (Selenium), а также через Appium с драйвером `Mac2`/`Windows`, если нужно взаимодействовать с элементами ОС за пределами окна приложения.

## Развёрнутый ответ

Electron — открытый фреймворк (разработан GitHub/OpenJS Foundation), позволяющий писать desktop-приложения, используя веб-технологии. Известные примеры: Visual Studio Code, Slack, Discord, Figma (desktop-версия), Postman.

Архитектурно Electron-приложение состоит из двух процессов:
- **Main process** — работает на Node.js, управляет жизненным циклом приложения, создаёт окна (`BrowserWindow`), имеет доступ к файловой системе, меню ОС, нативным диалогам.
- **Renderer process** — по сути это встроенный экземпляр Chromium, который рендерит UI приложения как обычную веб-страницу (HTML/CSS/JS выполняются в контексте Chromium).

Поскольку renderer process — это Chromium, к нему применим тот же механизм автоматизации, что и к обычному Chrome: DevTools Protocol. Это открывает два пути автоматизации:

1. **Selenium с ChromeDriver.** Так как Electron включает конкретную версию Chromium, нужно использовать `ChromeDriver`, версия которого совместима с этой версией Chromium (не с версией «обычного» установленного Chrome). При создании драйвера в `ChromeOptions` указывается путь к исполняемому файлу самого Electron-приложения через параметр `setBinary(pathToElectronApp)` — тогда ChromeDriver запускает не Chrome, а сам Electron-бинарник, чей UI-процесс основан на Chromium.

   ```java
   ChromeOptions options = new ChromeOptions();
   options.setBinary("/path/to/MyElectronApp.exe");
   WebDriver driver = new ChromeDriver(options);
   ```

   Такой подход отлично работает для тестирования UI внутри окна приложения (кнопки, формы, списки), но имеет ограничение: он не может напрямую взаимодействовать с нативными элементами ОС — системными диалогами открытия файла, меню в трее, глобальными горячими клавишами, — поскольку они не являются частью DOM Chromium.

2. **Appium с драйвером `Mac2` (macOS) или `Windows` (WinAppDriver).** Эти драйверы работают через нативные accessibility API операционной системы (macOS Accessibility API, Windows UI Automation), что позволяет находить и взаимодействовать с элементами как внутри окна Electron-приложения, так и за его пределами — системными диалогами, меню, уведомлениями ОС. Это более универсальный, но и более тяжеловесный подход.

На практике часто комбинируют: Selenium/ChromeDriver для тестирования основного UI приложения (быстро, стабильно, знакомый Selenium API) и Appium/WinAppDriver для сценариев, требующих взаимодействия с нативными диалогами ОС (например, диалог сохранения файла).

## Пример / когда применяется

```java
// Тестирование Electron-приложения через ChromeDriver
ChromeOptions options = new ChromeOptions();
options.setBinary("C:\\Program Files\\MyApp\\MyApp.exe");
WebDriver driver = new ChromeDriver(options);

driver.findElement(By.id("new-file-btn")).click();
// Дальше, если открывается системный диалог сохранения файла —
// его придётся обрабатывать через WinAppDriver/Appium или через
// эмуляцию клавиатурного ввода (Robot/AutoIt), т.к. это не DOM Chromium
```

Применяется для регрессионного тестирования desktop-приложений типа VS Code, Slack-подобных клиентов, внутренних corporate desktop-инструментов на Electron.

## На что смотрит интервьюер

- Понимание, что Electron = Chromium (UI) + Node.js (системный доступ), и что это даёт возможность использовать ChromeDriver.
- Знание про `setBinary()` в `ChromeOptions` для указания на исполняемый файл приложения.
- Понимание ограничения: ChromeDriver видит только DOM внутри окна, но не нативные системные диалоги ОС.
- Знание, что для нативных элементов ОС нужен Appium с `Mac2`/`WinAppDriver`.
- Follow-up: как синхронизировать версию ChromeDriver с версией Chromium, встроенной в конкретную версию Electron; альтернативы (Playwright имеет встроенную поддержку Electron через `_electron`).
- Красный флаг: утверждение, что Electron-приложения нельзя автоматизировать вообще, или что Selenium полностью покрывает все сценарии без ограничений.
