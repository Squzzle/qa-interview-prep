---
id: kakie-sposoby-click-i-send-keys-selenium
title: "Способы click и sendKeys в Selenium"
sidebar_position: 8
tags: ["AQA — Selenium"]
---

# Какие способы click и send keys Selenium?

**Коротко:** В Selenium существует несколько способов выполнить клик и ввод текста — стандартные методы `WebElement.click()`/`sendKeys()`, через класс `Actions`, а также fallback-варианты через `JavaScriptExecutor`; выбор зависит от того, ведёт ли себя элемент штатно, или требует обхода ограничений.

## Развёрнутый ответ

**Способы клика:**

1. **`element.click()`** — стандартный метод WebDriver. Эмулирует реальный клик пользователя: браузер генерирует полноценную последовательность событий (`mousedown`, `mouseup`, `click`). Перед выполнением WebDriver проверяет, что элемент видим и не перекрыт (иначе — `ElementClickInterceptedException`).
2. **`Actions.click(element).perform()`** — клик через класс `Actions`, полезен, когда нужно скомбинировать клик с другими действиями (например, навести курсор перед кликом — актуально для элементов, появляющихся по `hover`).
3. **JS-клик через `JavaScriptExecutor`** — `((JavascriptExecutor) driver).executeScript("arguments[0].click();", element)`. Используется как fallback, когда штатный клик не проходит проверку видимости/перекрытия, но нужно понимать, что это не полностью эмулирует пользовательское взаимодействие (см. вопрос про `JavaScriptExecutor`).
4. **Double click / Right click** — через `Actions`: `actions.doubleClick(element).perform()` и `actions.contextClick(element).perform()` — стандартный `click()` их не поддерживает.

**Способы ввода текста:**

1. **`element.sendKeys("text")`** — стандартный способ, эмулирует посимвольный ввод с клавиатуры, включая срабатывание JS-обработчиков `keydown`/`keyup`/`input`, которые часто завязаны на валидацию форм.
2. **`Actions.sendKeys(element, "text").perform()`** — используется, когда нужно скомбинировать ввод с другими действиями, либо когда фокус уже установлен на элементе иным способом.
3. **Ввод спецсимволов/комбинаций клавиш** — `sendKeys(Keys.chord(Keys.CONTROL, "a"))` для выделения всего текста, `sendKeys(Keys.ENTER)`, `sendKeys(Keys.TAB)` — через enum `Keys`.
4. **Установка значения через JS** — `executeScript("arguments[0].value = arguments[1];", element, "text")`. Быстрее, но не запускает те же события клавиатуры, что и `sendKeys`, из-за чего JS-валидация на фронте может не сработать. Используется как fallback (например, для `readonly` полей) или для ускорения заполнения больших форм в нагрузочных сценариях, где важна скорость, а не полная эмуляция пользователя.
5. **`element.clear()`** перед `sendKeys` — часто необходим, чтобы избежать дописывания текста к уже существующему значению поля.

Ключевое отличие штатных методов от JS-вариантов: штатные (`click()`, `sendKeys()`) эмулируют реальные события браузера и проходят встроенные проверки WebDriver (видимость, интерактивность, попадание в viewport), тогда как JS-варианты обходят эти проверки, что может как решить проблему нестабильного теста, так и скрыть реальный баг, который увидел бы настоящий пользователь.

## Пример / когда применяется

```java
WebElement input = driver.findElement(By.id("search"));

// Стандартный ввод
input.clear();
input.sendKeys("selenium webdriver");

// Ввод с последующим нажатием Enter
input.sendKeys(Keys.ENTER);

// Клик через Actions с предварительным наведением (для hover-меню)
Actions actions = new Actions(driver);
actions.moveToElement(driver.findElement(By.id("menu")))
       .click(driver.findElement(By.id("submenuItem")))
       .perform();

// Double click
actions.doubleClick(driver.findElement(By.id("editableCell"))).perform();

// Выделить всё и удалить (Ctrl+A, Delete)
input.sendKeys(Keys.chord(Keys.CONTROL, "a"));
input.sendKeys(Keys.DELETE);
```

Пример: если поле поиска раскрывает выпадающий список подсказок только при реальном посимвольном вводе (слушает `keyup`), а тест использует JS-установку значения, автокомплит не сработает — здесь обязателен `sendKeys()`, а не JS.

## На что смотрит интервьюер

- Знает ли кандидат разницу между штатными методами и их JS-аналогами, и когда каждый уместен.
- Упоминает ли `Actions` класс для double click, right click, drag-and-drop, hover-сценариев.
- Помнит ли про `Keys.chord()` для комбинаций клавиш и enum `Keys` для спецклавиш.
- Понимает ли, почему `element.clear()` важен перед `sendKeys()`.
- Красный флаг: предложение всегда использовать JS для ввода текста "потому что быстрее" — без понимания, что это может сломать JS-валидацию и автокомплит на фронте.
