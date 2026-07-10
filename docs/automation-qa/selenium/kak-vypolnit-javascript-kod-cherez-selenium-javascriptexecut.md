---
id: kak-vypolnit-javascript-kod-cherez-selenium-javascriptexecut
title: "Выполнение JavaScript через Selenium"
sidebar_position: 19
tags: ["Инициализация браузера и Selenium"]
---

# Как выполнить JavaScript код через Selenium (`JavascriptExecutor`)?

**Коротко:** Драйвер приводится к интерфейсу `JavascriptExecutor`, у которого есть методы `executeScript` (синхронное выполнение) и `executeAsyncScript` (асинхронное выполнение), позволяющие выполнять произвольный JS-код в контексте текущей страницы.

## Развёрнутый ответ

`WebDriver` в Java реализует интерфейс `JavascriptExecutor`, если браузер это поддерживает (Chrome, Firefox и все современные драйверы поддерживают). Чтобы получить доступ к методам исполнения скриптов, драйвер приводят типом:

```java
JavascriptExecutor js = (JavascriptExecutor) driver;
```

Основные методы:
- `executeScript(String script, Object... args)` — выполняет JS синхронно и возвращает результат (может быть `String`, `Long`, `Boolean`, `WebElement`, `List`, `Map` или `null`). Внутри скрипта аргументы доступны через `arguments[0]`, `arguments[1]` и т.д.
- `executeAsyncScript(String script, Object... args)` — выполняет асинхронный JS-код, ожидая вызова callback-функции, переданной последним аргументом `arguments[arguments.length - 1]`; полезно для ожидания завершения асинхронных операций (AJAX, промисы).

Типичные сценарии использования `JavascriptExecutor`:
- Клик по элементу, который перекрыт другим элементом или не реагирует на обычный `.click()` из-за особенностей рендеринга (`arguments[0].click()`).
- Прокрутка страницы к элементу: `window.scrollTo` или `arguments[0].scrollIntoView(true)`.
- Изменение значения поля напрямую в обход стандартного `sendKeys()`, когда поле readonly или требует специфичного события (`arguments[0].value='...'`).
- Получение значений, недоступных через стандартный API WebDriver, например `document.readyState` для проверки полной загрузки страницы.
- Подсветка элемента при отладке (изменение стиля border через JS) для визуальной диагностики теста.
- Работа с localStorage/sessionStorage (`window.localStorage.getItem(...)`).

Важный нюанс: злоупотребление `JavascriptExecutor` для клика в обход стандартного `WebElement.click()` считается антипаттерном, так как маскирует реальные проблемы (элемент действительно недоступен пользователю — значит, баг в приложении или в тесте), поэтому такие вызовы должны быть осознанным исключением, а не правилом.

## Пример / когда применяется

```java
JavascriptExecutor js = (JavascriptExecutor) driver;

// Клик через JS, если обычный click перехватывается оверлеем
WebElement button = driver.findElement(By.id("submit"));
js.executeScript("arguments[0].click();", button);

// Прокрутка к элементу
js.executeScript("arguments[0].scrollIntoView(true);", button);

// Проверка полной загрузки страницы
boolean isReady = js.executeScript("return document.readyState").equals("complete");

// Асинхронный скрипт с ожиданием AJAX
Object result = js.executeAsyncScript(
    "var callback = arguments[arguments.length - 1];" +
    "fetch('/api/status').then(r => r.json()).then(data => callback(data));"
);
```

## На что смотрит интервьюер

Проверяет знание разницы между `executeScript` и `executeAsyncScript`, а также понимание, что чрезмерное использование JS-кликов маскирует реальные проблемы доступности элементов. Хороший ответ приводит конкретные практические кейсы (scrollIntoView, обход overlay, localStorage). Follow-up: «почему клик через JS считается плохой практикой для UI-тестов, ориентированных на пользовательский опыт» и «как передать `WebElement` как аргумент в скрипт». Красный флаг — использование JS-клика как основного способа взаимодействия по умолчанию вместо `WebElement.click()`.
