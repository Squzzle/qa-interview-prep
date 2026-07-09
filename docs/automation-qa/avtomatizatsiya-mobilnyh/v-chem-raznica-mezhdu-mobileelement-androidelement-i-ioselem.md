---
id: v-chem-raznica-mezhdu-mobileelement-androidelement-i-ioselem
title: "Разница MobileElement AndroidElement IOSElement"
sidebar_position: 5
tags: ["Автоматизация мобильных приложений"]
---

# В чем разница между `MobileElement`, `AndroidElement` и `IOSElement`?

**Коротко:** `MobileElement` — общий, платформонезависимый тип элемента в Java-клиенте Appium, от которого наследуются платформо-специфичные `AndroidElement` и `IOSElement`, дающие доступ к дополнительным нативным методам своей платформы; в актуальных версиях Java-клиента эти классы устарели в пользу единого `WebElement`.

## Развёрнутый ответ

В Java-клиенте Appium исторически (Appium Java-client версий 6.x и ранее) существовала следующая иерархия классов:

- **`MobileElement`** — базовый класс, реализующий общий интерфейс `WebElement` (из Selenium) плюс мобильные расширения (`tap`, `swipe`, `pinch` и т.д.), применимый к обеим платформам одинаково.

- **`AndroidElement`** — наследник `MobileElement`, добавляющий Android-специфичные методы, например `getLocation`, работу с `UiSelector`-подобными вызовами, специфичные жесты и атрибуты Android accessibility API.

- **`IOSElement`** — наследник `MobileElement`, добавляющий iOS-специфичные методы и работу с атрибутами XCTest/XCUITest (`isAccessible`, `type` и iOS-жесты).

Использование конкретного типа (`AndroidElement`/`IOSElement`) вместо обобщённого `MobileElement` даёт доступ к методам, специфичным для платформы, но требует дублирования логики или условных веток при написании кроссплатформенных тестов.

Начиная с Appium Java-client 7+ (для Appium 2.x), эта иерархия была признана избыточной и **устарела (deprecated)**: рекомендуется использовать обычный `WebElement` (из Selenium), а для платформо-специфичных действий — отдельные вспомогательные классы и утилиты (`AndroidDriver`, `IOSDriver` как обёртки над драйвером, а не над элементом). Это упростило API и уменьшило путаницу с типами.

## Пример / когда применяется

Старый подход (deprecated):

```java
AndroidDriver driver = new AndroidDriver(url, capabilities);
AndroidElement element = (AndroidElement) driver.findElement(By.id("btn"));
element.tap(1, 500);
```

Актуальный подход:

```java
AndroidDriver driver = new AndroidDriver(url, capabilities);
WebElement element = driver.findElement(By.id("btn"));
element.click();
```

## На что смотрит интервьюер

Важно показать осведомлённость об эволюции Appium Java-client: если кандидат уверенно использует устаревшие типы как "текущий стандарт" — это красный флаг устаревших знаний. Хороший ответ включает упоминание, что различие исторически существовало для типобезопасного доступа к платформо-специфичным методам, но было упрощено ради единого API и снижения дублирования кода в кроссплатформенных фреймворках.
