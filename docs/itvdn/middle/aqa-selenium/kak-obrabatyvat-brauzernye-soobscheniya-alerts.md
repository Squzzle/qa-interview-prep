---
id: kak-obrabatyvat-brauzernye-soobscheniya-alerts
title: "Обработка браузерных alert-сообщений"
sidebar_position: 5
tags: ["AQA — Selenium"]
---

# Как обрабатывать браузерные сообщения (alerts)?

**Коротко:** нативные диалоги браузера (`alert`, `confirm`, `prompt`) не являются частью DOM страницы, поэтому Selenium предоставляет отдельный интерфейс `Alert` через `driver.switchTo().alert()`, позволяющий принять, отклонить, прочитать текст или ввести данные в диалог.

## Развёрнутый ответ

JavaScript-функции `window.alert()`, `window.confirm()` и `window.prompt()` создают нативные, генерируемые операционной системой/браузером диалоговые окна, которые находятся вне DOM веб-страницы. Из-за этого их нельзя найти через `findElement` — попытка это сделать заблокирует выполнение остальных команд, потому что модальный диалог перехватывает управление потоком браузера, пока не будет закрыт.

Selenium предоставляет специальный API для работы с такими диалогами через интерфейс `Alert`:

```
Alert alert = driver.switchTo().alert();
```

После получения объекта `Alert` доступны методы:
- `alert.accept()` — нажать «OK» (подтвердить);
- `alert.dismiss()` — нажать «Cancel» (отклонить);
- `alert.getText()` — получить текст сообщения диалога;
- `alert.sendKeys(text)` — ввести текст в поле `prompt`-диалога (для `alert`/`confirm` этот метод не имеет смысла, так как там нет текстового поля).

Типы диалогов:
- **alert** — только сообщение и кнопка OK; можно только `accept()`.
- **confirm** — сообщение с кнопками OK/Cancel; можно `accept()` или `dismiss()`, возвращает true/false в JS в зависимости от выбора.
- **prompt** — сообщение с текстовым полем и кнопками OK/Cancel; можно `sendKeys()` перед `accept()`.

Важные нюансы:
- Если диалог не появился, а тест вызывает `switchTo().alert()`, будет выброшено `NoAlertPresentException`. Поэтому перед обращением к алерту стоит использовать явное ожидание: `wait.until(ExpectedConditions.alertIsPresent())`.
- Незакрытый alert блокирует последующие команды драйвера (браузер «зависает» в ожидании реакции пользователя), поэтому важно всегда обрабатывать диалог сразу после действия, которое его вызывает.
- Selenium умеет работать только с нативными браузерными диалогами. Кастомные модальные окна, реализованные через HTML/CSS/JS (`div` с оверлеем), — это обычные DOM-элементы, и с ними нужно работать как с обычными элементами страницы (`findElement` + `click`), а не через `Alert` API.
- В Chrome по умолчанию можно настроить автоматическое поведение на unhandled alert через capability `unhandledPromptBehavior` (`accept`, `dismiss`, `ignore` и т.д.).

## Пример / когда применяется

```java
driver.findElement(By.id("delete-btn")).click();

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
Alert alert = wait.until(ExpectedConditions.alertIsPresent());

System.out.println(alert.getText()); // "Вы уверены, что хотите удалить запись?"
alert.accept(); // подтверждаем удаление
```

Пример с `prompt`:

```java
Alert alert = driver.switchTo().alert();
alert.sendKeys("Тестовый комментарий");
alert.accept();
```

## На что смотрит интервьюер

- Понимание, что alert/confirm/prompt — не DOM-элементы и требуют отдельного API.
- Знание всех методов интерфейса `Alert` и разницы между `accept()`/`dismiss()`.
- Умение объяснить, почему нужно явное ожидание `alertIsPresent()`, а не просто `switchTo().alert()` сразу.
- Follow-up: чем кастомное модальное окно отличается от нативного alert, как настроить `unhandledPromptBehavior`, что произойдёт, если не обработать alert вовреме.
- Красный флаг: попытка найти alert через `findElement` или незнание о блокирующей природе диалогов.
