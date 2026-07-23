---
id: kakie-exceptions-mozhet-brosit-selenium-chto-oni-oznachayut
title: "Исключения Selenium и их обработка"
sidebar_position: 5
tags: ["AQA — Selenium"]
---

# Какие exceptions может бросить Selenium? Что они означают и как их обрабатывать?

**Коротко:** Selenium бросает специфичные исключения (наследники `WebDriverException`), сигнализирующие о проблемах поиска элемента, взаимодействия с ним или состояния сессии; правильная обработка — это использование Waits и корректных locator-стратегий, а не бездумный try/catch.

## Развёрнутый ответ

Все исключения Selenium наследуются от `org.openqa.selenium.WebDriverException`, который в свою очередь является unchecked-исключением (`RuntimeException`). Наиболее часто встречающиеся:

- **`NoSuchElementException`** — элемент не найден в DOM по указанному локатору. Причины: неверный локатор, элемент ещё не отрисован (проблема синхронизации), элемент находится внутри `iframe`, а контекст не переключён.
- **`ElementNotInteractableException`** (в старых версиях — `ElementNotVisibleException`) — элемент присутствует в DOM, но не видим или не интерактивен (например, скрыт через `display: none`, перекрыт другим элементом, или находится вне видимой области).
- **`StaleElementReferenceException`** — ссылка на `WebElement`, полученная ранее, больше не действительна, потому что DOM обновился (страница перезагрузилась, элемент был удалён и заново создан через JS-фреймворк). Решение — заново найти элемент через `findElement` перед взаимодействием.
- **`TimeoutException`** — истекло время ожидания в `WebDriverWait`, условие так и не выполнилось.
- **`NoSuchWindowException`** / **`NoSuchFrameException`** — попытка переключиться на несуществующее окно или фрейм.
- **`ElementClickInterceptedException`** — клик не может быть выполнен, потому что другой элемент перекрывает целевой (например, поверх лежит модальное окно, sticky-header или overlay-баннер).
- **`SessionNotCreatedException`** — не удалось создать сессию драйвера, чаще всего из-за несовместимости версий браузера и драйвера.
- **`InvalidSelectorException`** — синтаксически некорректный локатор (например, невалидный XPath).
- **`UnhandledAlertException`** — на странице появилось JS `alert`/`confirm`/`prompt`, который блокирует выполнение команд, пока не обработан.

**Подходы к обработке:**

1. **Профилактика через явные ожидания** — вместо try/catch вокруг `NoSuchElementException` правильнее использовать `WebDriverWait` с нужным `ExpectedCondition`, чтобы исключение вообще не возникало в штатной ситуации.
2. **`StaleElementReferenceException`** обычно решается повторным поиском элемента (retry-логика) или паттерном Page Object, где метод инкапсулирует получение свежего элемента при каждом обращении.
3. **`ElementClickInterceptedException`** — решается либо ожиданием исчезновения перекрывающего элемента, либо кликом через `JavascriptExecutor` как fallback (осторожно — маскирует реальную проблему UX, если она есть).
4. **`UnhandledAlertException`** — обрабатывается явным переключением на alert через `driver.switchTo().alert()` и вызовом `accept()`/`dismiss()`.
5. Try/catch стоит использовать точечно, когда исключение — это ожидаемая часть логики теста (например, проверка, что элемент **отсутствует**), а не как способ "спрятать" нестабильность теста.

Важно не злоупотреблять try/catch как "глушителем" ошибок — если тест регулярно ловит и игнорирует `NoSuchElementException`, это признак плохой синхронизации, а не решённой проблемы.

## Пример / когда применяется

Обработка `StaleElementReferenceException` через повторный поиск:

```java
public void clickWithRetry(By locator) {
    int attempts = 0;
    while (attempts < 2) {
        try {
            driver.findElement(locator).click();
            break;
        } catch (StaleElementReferenceException e) {
            attempts++;
        }
    }
}
```

Обработка `UnhandledAlertException`:

```java
try {
    driver.findElement(By.id("saveBtn")).click();
} catch (UnhandledAlertException e) {
    Alert alert = driver.switchTo().alert();
    alert.accept();
}
```

Проверка отсутствия элемента (ожидаемое использование исключения как условия):

```java
boolean isElementAbsent(By locator) {
    try {
        driver.findElement(locator);
        return false;
    } catch (NoSuchElementException e) {
        return true;
    }
}
```

## На что смотрит интервьюер

- Может ли кандидат назвать хотя бы 5-6 реальных исключений и объяснить причину каждого, а не только `NoSuchElementException`.
- Понимает ли разницу между `NoSuchElementException` и `StaleElementReferenceException` — частый вопрос на разграничение похожих, но разных проблем.
- Знает ли правильный подход: не "ловить и игнорировать", а устранять первопричину через синхронизацию (waits).
- Упоминает ли `ElementClickInterceptedException` и знает причины (overlay, sticky-элементы).
- Красный флаг: предложение "оборачивать всё в try/catch и игнорировать" как универсальное решение — показывает непонимание природы flaky-тестов.
