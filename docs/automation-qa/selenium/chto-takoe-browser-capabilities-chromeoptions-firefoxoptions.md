---
id: chto-takoe-browser-capabilities-chromeoptions-firefoxoptions
title: "Browser Capabilities и Options"
sidebar_position: 6
tags: ["Инициализация браузера и Selenium"]
---

# Что такое Browser Capabilities (`ChromeOptions`, `FirefoxOptions`)? Для чего их используют?

**Коротко:** Capabilities — это набор пар ключ-значение, описывающих желаемые характеристики и поведение сессии браузера (версия, платформа, флаги запуска, прокси и т.д.); `ChromeOptions`/`FirefoxOptions` — это типизированные, специфичные для браузера классы-обёртки, которые формируют эти capabilities и передаются при создании сессии WebDriver.

## Развёрнутый ответ

Когда клиент Selenium создаёт новую сессию (`new ChromeDriver(options)`), он отправляет драйверу запрос на создание сессии с телом, описывающим желаемые **capabilities** — по сути, JSON-объект с настройками того, как должна выглядеть и вести себя сессия браузера. Согласно W3C WebDriver Protocol, capabilities передаются в виде `alwaysMatch` (обязательные требования) и `firstMatch` (список альтернатив, из которых нужно совпадение хотя бы одного набора).

Базовые (общие для всех браузеров) capabilities включают: `browserName`, `browserVersion`, `platformName`, `acceptInsecureCerts`, `pageLoadStrategy`, `proxy`, `timeouts`.

Помимо базовых, у каждого браузера есть **специфичные (vendor-specific) capabilities**, которые в JSON передаются под ключом вида `goog:chromeOptions` (для Chrome) или `moz:firefoxOptions` (для Firefox). Именно для удобной работы с этими специфичными настройками в клиентских библиотеках существуют классы `ChromeOptions` и `FirefoxOptions` — они предоставляют типобезопасный, программный API вместо ручного составления JSON.

Через `ChromeOptions` можно задать, например:
- аргументы командной строки браузера (`addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080")`);
- experimental options (например, отключение баннера "Chrome управляется автоматизированным ПО": `setExperimentalOption("excludeSwitches", List.of("enable-automation"))`);
- профиль/расширения (`addExtensions`, `setBinary` для указания пути к бинарнику браузера);
- `mobileEmulation` для эмуляции мобильных устройств;
- prefs (например, автоматическое разрешение на скачивание файлов без диалога, отключение уведомлений).

`FirefoxOptions` аналогично позволяет задавать аргументы (`-headless`), профиль (`FirefoxProfile`), preferences (`setPreference("dom.webnotifications.enabled", false)`), путь к бинарнику.

Использование Options/Capabilities нужно для:
1. Настройки поведения браузера под задачи автоматизации (отключение всплывающих окон, headless-режим, размер окна).
2. Управления безопасностью соединения (принятие небезопасных сертификатов на тестовых стендах).
3. Настройки удалённого запуска через Selenium Grid или облачные платформы (BrowserStack, Sauce Labs), где через capabilities указывается нужная ОС, версия браузера, разрешение экрана и т.д.
4. Настройки стратегии загрузки страниц (`pageLoadStrategy: eager/normal/none`) для ускорения тестов.

## Пример / когда применяется

```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless=new");
options.addArguments("--window-size=1920,1080");
options.setExperimentalOption("excludeSwitches", List.of("enable-automation"));
options.setAcceptInsecureCerts(true);

WebDriver driver = new ChromeDriver(options);
```

Пример использования capabilities для запуска на Selenium Grid / облачном сервисе:

```java
MutableCapabilities capabilities = new MutableCapabilities();
capabilities.setCapability("browserName", "chrome");
capabilities.setCapability("browserVersion", "latest");
capabilities.setCapability("platformName", "Windows 10");

WebDriver driver = new RemoteWebDriver(new URL("http://grid-hub:4444/wd/hub"), capabilities);
```

## На что смотрит интервьюер

- Понимание разницы между общими W3C-capabilities и vendor-specific (`goog:chromeOptions`, `moz:firefoxOptions`).
- Практический опыт настройки headless-режима, отключения индикатора автоматизации, работы с профилями/расширениями.
- Понимание, что Options — это удобная обёртка над сырыми capabilities, а не отдельная независимая сущность.
- Умение объяснить применение при работе с Selenium Grid/облачными грид-сервисами.
