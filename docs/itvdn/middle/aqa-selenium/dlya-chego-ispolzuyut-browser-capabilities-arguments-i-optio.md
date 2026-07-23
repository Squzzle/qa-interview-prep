---
id: dlya-chego-ispolzuyut-browser-capabilities-arguments-i-optio
title: "Browser capabilities, arguments и options"
sidebar_position: 3
tags: ["AQA — Selenium"]
---

# Для чего используют browser capabilities, arguments и options?

**Коротко:** capabilities описывают желаемые свойства сессии браузера (версия, платформа, флаги), arguments — это флаги командной строки, с которыми запускается сам браузер (headless, размер окна, отключение расширений), а options — объект-обёртка в клиентской библиотеке, объединяющий capabilities, arguments и дополнительные настройки в единый конфигурационный объект, передаваемый при создании драйвера.

## Развёрнутый ответ

При создании сессии WebDriver клиент должен сообщить драйверу, какой браузер запускать и с какими настройками. Для этого используются три связанных, но разных механизма:

- **Capabilities** — набор пар ключ-значение, описывающих желаемые характеристики сессии согласно спецификации W3C WebDriver: `browserName`, `browserVersion`, `platformName`, `acceptInsecureCerts`, `pageLoadStrategy`, а также vendor-specific расширения (`goog:chromeOptions`, `moz:firefoxOptions`). Capabilities — это то, что реально передаётся в теле HTTP-запроса `POST /session` драйверу.

- **Arguments (аргументы командной строки)** — это флаги, с которыми запускается исполняемый файл браузера как процесс операционной системы: например, `--headless`, `--window-size=1920,1080`, `--disable-gpu`, `--incognito`, `--user-data-dir=...`. Они не являются частью W3C-стандарта напрямую, а специфичны для конкретного браузера (Chrome/Chromium принимает свой набор флагов, Firefox — свой).

- **Options** — это объект в клиентской библиотеке конкретного языка (`ChromeOptions`, `FirefoxOptions`, `EdgeOptions` в Java/Python/C#), который служит удобной абстракцией: он позволяет добавлять аргументы (`addArguments`), устанавливать preferences, экспериментальные опции, прокси, capabilities — а затем сериализуется в правильный JSON-формат capabilities при вызове `new ChromeDriver(options)`.

Таким образом, порядок использования такой: разработчик конфигурирует объект **Options** → добавляет туда **arguments** и специфичные настройки → при создании драйвера Options конвертируется в объект **capabilities**, который отправляется драйверу браузера по протоколу WebDriver.

Практическое значение: options/arguments нужны для управления поведением конкретного экземпляра браузера (headless-режим для CI, эмуляция мобильных устройств, отключение уведомлений, установка прокси, отключение изображений для ускорения тестов), а capabilities — для согласования сессии между клиентом и удалённым сервером (важно при использовании Selenium Grid/облачных сервисов, где нужно указать, какую версию и платформу браузера запустить).

## Пример / когда применяется

```java
ChromeOptions options = new ChromeOptions();
options.addArguments("--headless=new");
options.addArguments("--window-size=1920,1080");
options.addArguments("--disable-notifications");
options.setCapability("acceptInsecureCerts", true);

WebDriver driver = new ChromeDriver(options);
```

Пример использования на Selenium Grid, где capabilities указывают на нужную конфигурацию удалённого узла:

```java
ChromeOptions options = new ChromeOptions();
options.setPlatformName("LINUX");
options.setBrowserVersion("120");

WebDriver driver = new RemoteWebDriver(new URL("http://grid-hub:4444/wd/hub"), options);
```

## На что смотрит интервьюер

- Понимание, что options — это языковая обёртка, а capabilities — это то, что реально передаётся по сети.
- Знание конкретных полезных arguments (headless, window-size, disable-extensions, user-agent).
- Умение объяснить, зачем capabilities критичны при работе с Selenium Grid или облачными фермами браузеров (BrowserStack, Sauce Labs).
- Follow-up: разница между W3C capabilities и устаревшими desired capabilities; как задать proxy или mobile emulation.
- Красный флаг: путаница терминов, будто это три синонима одного и того же.
