---
id: kakie-instrumenty-dlya-avtomatizacii-android-vy-znaete-espre
title: "Инструменты автоматизации Android и iOS"
sidebar_position: 6
tags: ["Автоматизация мобильных приложений"]
---

# Какие инструменты для автоматизации Android вы знаете (Espresso, UI Automator)? А для iOS (XCUITest)?

**Коротко:** Для Android основные нативные инструменты — Espresso (внутриприложенческие UI-тесты) и UI Automator (кроссприложенческие/системные тесты), а для iOS — XCUITest, встроенный в XCTest фреймворк Apple; Appium использует их как драйверы под капотом.

## Развёрнутый ответ

**Android:**

- **Espresso** — фреймворк от Google для написания быстрых и надёжных UI-тестов внутри одного приложения. Работает в том же процессе, что и тестируемое приложение, синхронизируется с UI-потоком автоматически (нет нужды в явных `sleep`/`wait`), поддерживает `ViewMatchers`, `ViewActions`, `ViewAssertions`, IdlingResource для асинхронных операций. Не может тестировать системные элементы или несколько приложений одновременно.

- **UI Automator (UIAutomator2)** — фреймворк для тестирования, который работает вне процесса приложения через Accessibility Service, что позволяет взаимодействовать с системным UI (уведомления, настройки, другие приложения). Медленнее Espresso, но более гибкий по охвату. Именно UIAutomator2 лежит в основе одноимённого Appium-драйвера для Android.

- Дополнительно стоит упомянуть **Robotium** (устаревший предшественник Espresso) и **Compose Testing** для Jetpack Compose UI.

**iOS:**

- **XCUITest** — часть фреймворка XCTest от Apple, интегрирован в Xcode. Позволяет писать UI-тесты на Swift/Objective-C, использует технологию Accessibility для поиска элементов, поддерживает запись действий (Test Recorder). Быстрый и стабильный, так как работает через официальный системный API Apple. Appium использует XCUITest как драйвер для iOS с версии Appium 1.6+ (заменив устаревший UIAutomation).

- Дополнительно можно упомянуть **EarlGrey** от Google (аналог Espresso для iOS, менее популярен после развития XCUITest).

## Пример / когда применяется

Пример Espresso-теста:

```kotlin
onView(withId(R.id.login_button))
    .perform(click())
onView(withId(R.id.welcome_text))
    .check(matches(isDisplayed()))
```

Пример XCUITest на Swift:

```swift
let app = XCUIApplication()
app.buttons["login_button"].tap()
XCTAssertTrue(app.staticTexts["welcome_text"].exists)
```

Espresso и XCUITest обычно применяются командой разработки (unit/UI-тесты в составе CI), тогда как Appium поверх них используется QA-командой для сквозных end-to-end сценариев, независимых от языка реализации приложения.

## На что смотрит интервьюер

Ожидается чёткое разграничение "белого ящика" (Espresso/XCUITest — тесты пишутся разработчиками, требуют доступа к исходному коду и пересборки) и "чёрного ящика" (Appium/UI Automator — тесты работают с готовым APK/IPA). Частый вопрос — почему Espresso быстрее и стабильнее Appium (нет сетевого/HTTP слоя, прямая синхронизация с UI-потоком) и когда стоит выбрать нативный инструмент вместо Appium (когда важна скорость CI и не нужна кроссплатформенность).
