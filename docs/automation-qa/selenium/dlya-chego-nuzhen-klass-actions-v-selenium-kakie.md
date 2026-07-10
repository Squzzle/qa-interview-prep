---
id: dlya-chego-nuzhen-klass-actions-v-selenium-kakie
title: "Класс Actions в Selenium"
sidebar_position: 16
tags: ["Инициализация браузера и Selenium"]
---

# Для чего нужен класс `Actions` в Selenium? Какие действия он позволяет выполнять?

**Коротко:** Класс `Actions` реализует API для построения сложных пользовательских взаимодействий (drag-and-drop, наведение мыши, зажатие клавиш, множественные жесты), которые невозможно выполнить простыми методами `WebElement.click()`/`sendKeys()`.

## Развёрнутый ответ

Стандартные методы `WebElement` (`click()`, `sendKeys()`, `clear()`) покрывают только базовые одиночные действия. Класс `org.openqa.selenium.interactions.Actions` предоставляет fluent-API для построения цепочки низкоуровневых действий мыши и клавиатуры, которые выполняются как единая последовательность через `build().perform()`.

Основные возможности `Actions`:
- `moveToElement(element)` — наведение курсора на элемент (для проверки hover-эффектов, всплывающих подсказок, выпадающих меню).
- `clickAndHold()` / `release()` — зажатие и отпускание кнопки мыши.
- `dragAndDrop(source, target)` и `dragAndDropBy(element, xOffset, yOffset)` — перетаскивание элементов.
- `doubleClick()` — двойной клик.
- `contextClick()` — клик правой кнопкой мыши (вызов контекстного меню).
- `keyDown(key)` / `keyUp(key)` — зажатие/отпускание модификаторов (`Keys.SHIFT`, `Keys.CONTROL`) для комбинаций клавиш, например выделения текста через `Shift+Click` или множественного выбора.
- `sendKeys(keys)` — отправка последовательности клавиш без привязки к конкретному элементу (в текущий фокус).
- `moveByOffset(x, y)` — перемещение курсора на смещение относительно текущей позиции.
- `pause(duration)` — вставка паузы между шагами цепочки (иногда необходимо для корректной обработки событий браузером).

Все вызовы накапливаются во внутренней очереди действий (`Action` composite), а фактическое выполнение происходит только после вызова `.perform()` — до этого момента ничего не отправляется в браузер.

## Пример / когда применяется

```java
Actions actions = new Actions(driver);

// Drag and drop
actions.dragAndDrop(sourceElement, targetElement).perform();

// Наведение и клик по появившемуся пункту меню
actions.moveToElement(menuElement)
       .moveToElement(submenuItem)
       .click()
       .perform();

// Выделение текста через Shift+Click
actions.keyDown(Keys.SHIFT)
       .click(lastItem)
       .keyUp(Keys.SHIFT)
       .perform();
```

Применяется при тестировании UI с drag-and-drop интерфейсами (канбан-доски, файловые загрузчики), выпадающими меню на hover, кастомными слайдерами и контекстными меню.

## На что смотрит интервьюер

Проверяет, знает ли кандидат, что `Actions` работает как построитель цепочки действий и требует явного `.perform()`. Хороший ответ упоминает конкретные сценарии (drag-and-drop, hover, комбинации клавиш), а не только перечисление методов. Follow-up: «чем `dragAndDrop` отличается от `clickAndHold + moveToElement + release`» (иногда составной вариант нужен, так как встроенный `dragAndDrop` может не срабатывать на элементах с кастомной JS-обработкой drag-событий, HTML5 Drag&Drop API). Красный флаг — незнание, что без `.perform()` действия не выполняются.
