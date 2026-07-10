---
id: kak-v-selenium-pereklyuchitsya-na-vsplyvayuschee-okno-alert
title: "Работа с alert окнами в Selenium"
sidebar_position: 17
tags: ["Инициализация браузера и Selenium"]
---

# Как в Selenium переключиться на всплывающее окно (alert), принять или отклонить его?

**Коротко:** Через `driver.switchTo().alert()` получают интерфейс `Alert`, у которого есть методы `accept()`, `dismiss()`, `getText()` и `sendKeys()` для работы с нативными JavaScript-диалогами `alert`, `confirm` и `prompt`.

## Развёрнутый ответ

Нативные браузерные диалоги (`window.alert()`, `window.confirm()`, `window.prompt()`) не являются частью DOM страницы, поэтому обычные локаторы (`findElement`) их не видят. Selenium предоставляет отдельный API для переключения фокуса драйвера на такое окно:

```java
Alert alert = driver.switchTo().alert();
```

После получения объекта `Alert` доступны методы:
- `accept()` — нажать "OK" (принять alert/confirm/prompt).
- `dismiss()` — нажать "Cancel" (отклонить confirm/prompt; для простого `alert` в некоторых браузерах эквивалентно accept, так как там одна кнопка).
- `getText()` — получить текст сообщения диалога.
- `sendKeys(text)` — ввести текст в поле `prompt` перед подтверждением.

Важные нюансы:
- Если alert открыт, а тест пытается выполнить любое действие с обычными элементами страницы (например, `findElement`), Selenium выбросит `UnhandledAlertException`, поэтому alert нужно обработать сразу после действия, которое его вызывает.
- Перед обращением к alert часто нужно дождаться его появления через `WebDriverWait` с условием `ExpectedConditions.alertIsPresent()`, так как alert может появиться не мгновенно.
- После `accept()`/`dismiss()` фокус драйвера автоматически возвращается на основную страницу — дополнительно переключаться назад не требуется.
- Selenium не умеет работать с браузерными диалогами уровня ОС, не относящимися к JS (например, диалог выбора файла `input[type=file]` — с ним работают через `sendKeys` на сам input, не через `Alert`).

## Пример / когда применяется

```java
driver.findElement(By.id("showConfirm")).click();

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
Alert alert = wait.until(ExpectedConditions.alertIsPresent());

System.out.println(alert.getText());
alert.accept(); // либо alert.dismiss();
```

Для `prompt`:
```java
Alert alert = driver.switchTo().alert();
alert.sendKeys("test input");
alert.accept();
```

## На что смотрит интервьюер

Проверяет знание конкретных методов `Alert` и понимание, что alert не является DOM-элементом. Хороший ответ упоминает `alertIsPresent()` и потенциальный `UnhandledAlertException`. Follow-up: «что будет, если не обработать alert и попытаться кликнуть на другой элемент» и «как обработать alert, который появляется асинхронно после AJAX-запроса». Красный флаг — попытка искать alert через `findElement(By.className("alert"))` (типичная ошибка новичков, путающих нативный alert с кастомным modal-окном на странице).
