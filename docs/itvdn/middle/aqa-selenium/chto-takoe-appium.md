---
id: chto-takoe-appium
title: "Что такое Appium"
sidebar_position: 6
tags: ["AQA — Selenium"]
---

# Что такое Appium?

**Коротко:** Appium — это open-source кросс-платформенный фреймворк для автоматизации тестирования нативных, гибридных и мобильных веб-приложений на iOS и Android (а также desktop-приложений на Windows/Mac), построенный на протоколе WebDriver, что позволяет писать тесты на том же API и в тех же паттернах, что и в Selenium.

## Развёрнутый ответ

Appium расширяет спецификацию WebDriver для управления не браузерами, а мобильными и desktop-приложениями. Ключевые архитектурные принципы:

1. **Клиент-серверная архитектура, аналогичная Selenium.** Appium Server — это Node.js-приложение (может быть развёрнуто отдельно), которое принимает HTTP-запросы от клиентской библиотеки (Java/Python/C#/JS — обычно через библиотеки `Appium Client`, которые расширяют `Selenium WebDriver`).

2. **«Драйверы» под каждую платформу.** Appium Server сам по себе — это диспетчер, который делегирует выполнение команд специфичным драйверам:
   - `UiAutomator2` (или устаревший `Selendroid`) — для нативных Android-приложений, использует Android Instrumentation API.
   - `XCUITest` — для iOS, использует Apple XCTest framework.
   - `Espresso` driver — альтернативный быстрый драйвер для Android.
   - `Mac2`/`Windows` driver — для desktop-автоматизации.
   - `Gecko`/`Chromium` — для мобильного веба внутри WebView или мобильного браузера.

3. **Единый код для разных платформ.** Так как Appium использует тот же протокол WebDriver, что и Selenium, многие конструкции (`findElement`, `By`-локаторы, `WebDriverWait`) переносятся почти без изменений, что снижает порог входа для QA, уже знакомых с Selenium.

4. **Типы приложений, которые тестирует Appium**:
   - **Native apps** — написаны нативно под платформу (Swift/Kotlin/Java), тестируются через нативные accessibility-элементы.
   - **Hybrid apps** — сочетание нативного контейнера и WebView с веб-контентом внутри; Appium умеет переключаться между нативным контекстом и WebView-контекстом (`driver.context("WEBVIEW_...")`), аналогично переключению на iframe в Selenium.
   - **Mobile web apps** — обычные веб-сайты, открытые в мобильном браузере (Chrome для Android, Safari для iOS).

5. **Desired Capabilities для мобильного тестирования** дополнительно включают: `platformName`, `platformVersion`, `deviceName`, `app` (путь к `.apk`/`.ipa`), `automationName`, `udid` и др.

Appium также интегрируется с облачными фермами реальных устройств (BrowserStack App Automate, Sauce Labs, AWS Device Farm) и с эмуляторами/симуляторами для локального тестирования.

## Пример / когда применяется

```java
DesiredCapabilities caps = new DesiredCapabilities();
caps.setCapability("platformName", "Android");
caps.setCapability("automationName", "UiAutomator2");
caps.setCapability("deviceName", "Pixel_6_API_33");
caps.setCapability("app", "/path/to/app-debug.apk");

AndroidDriver driver = new AndroidDriver(new URL("http://127.0.0.1:4723/"), caps);

WebElement loginButton = driver.findElement(AppiumBy.accessibilityId("login_button"));
loginButton.click();
```

Применяется, когда нужно автоматизировать: регрессионное тестирование мобильного приложения перед релизом в App Store/Google Play, кроссплатформенные smoke-тесты на реальных устройствах, тестирование push-уведомлений, жестов (swipe, pinch), работы с камерой/геолокацией.

## На что смотрит интервьюер

- Понимание, что Appium базируется на протоколе WebDriver, а не является полностью independent инструментом.
- Знание разницы между native, hybrid и mobile web приложениями и как Appium работает с каждым типом.
- Знание конкретных драйверов (`UiAutomator2`, `XCUITest`) и capabilities для мобильных тестов.
- Follow-up: как переключаться между WebView и native context в гибридном приложении, как работает `AppiumBy.accessibilityId`, разница между эмулятором и реальным устройством при тестировании.
- Красный флаг: путаница Appium с Selenium как будто это один и тот же инструмент без архитектурных различий.
