---
id: kakie-isklyucheniya-exceptions-v-selenium-vy-znaete-nosuchel
title: "Основные исключения Selenium"
sidebar_position: 14
tags: ["Инициализация браузера и Selenium"]
---

# Какие исключения (exceptions) в Selenium вы знаете (`NoSuchElementException`, `StaleElementReferenceException`, `TimeoutException`)?

**Коротко:** Основные исключения Selenium сигнализируют о разных проблемах поиска и взаимодействия с элементами — отсутствие элемента, устаревшую ссылку на DOM-узел, истечение времени ожидания, невозможность взаимодействия и потерю сессии драйвера.

## Развёрнутый ответ

Наиболее часто встречающиеся исключения в Selenium WebDriver:

- `NoSuchElementException` — выбрасывается, когда локатор не находит ни одного элемента в DOM на момент вызова `findElement`. Причины: неверный локатор, элемент ещё не отрисован, элемент находится внутри iframe или shadow DOM.
- `StaleElementReferenceException` — возникает, когда ранее найденный `WebElement` больше не привязан к актуальному DOM (страница перезагрузилась, элемент был удалён и пересоздан, например после AJAX-обновления). Ссылка на объект в памяти теста становится "протухшей".
- `TimeoutException` — выбрасывается `WebDriverWait`, если условие ожидания (`ExpectedConditions`) не выполнилось за отведённое время.
- `ElementNotInteractableException` / `ElementClickInterceptedException` — элемент найден и присутствует в DOM, но невидим, перекрыт другим элементом (например, модальным окном) или отключён, поэтому клик/ввод невозможен.
- `NoSuchWindowException` / `NoSuchFrameException` — попытка переключиться на несуществующее окно или фрейм.
- `WebDriverException` / `SessionNotCreatedException` — общая ошибка драйвера, часто связана с несовместимостью версии браузера и драйвера или потерей соединения с браузером.
- `InvalidSelectorException` — синтаксически некорректный XPath или CSS-селектор.

Все специфичные исключения Selenium наследуются от `WebDriverException`, который в свою очередь наследует `RuntimeException`, поэтому их можно ловить как единой иерархией, так и по отдельности для разной обработки (например, для retry-логики при `StaleElementReferenceException`).

## Пример / когда применяется

```java
try {
    WebElement el = driver.findElement(By.id("login"));
    el.click();
} catch (StaleElementReferenceException e) {
    // элемент устарел — перезапрашиваем его заново
    driver.findElement(By.id("login")).click();
} catch (NoSuchElementException e) {
    // элемент вообще не найден — логируем и падаем осознанно
    throw new AssertionError("Login button not found", e);
}
```

Типичный сценарий `StaleElementReferenceException`: поиск строки в таблице, затем сортировка таблицы через клик, после чего старая ссылка на строку становится невалидной — нужно заново искать элемент после действия, изменившего DOM.

## На что смотрит интервьюер

Проверяет, различает ли кандидат причины каждого исключения, а не просто перечисляет названия. Важно, чтобы кандидат понимал разницу между «элемента нет в DOM» (`NoSuchElementException`) и «элемент есть, но недоступен для взаимодействия» (`ElementNotInteractableException`). Частый follow-up — как обрабатывать `StaleElementReferenceException` в реальном фреймворке (паттерн retry, повторный поиск через Page Object). Красный флаг — незнание иерархии исключений или попытка "гасить" все исключения одним `catch (Exception e)` без разбора причины.
