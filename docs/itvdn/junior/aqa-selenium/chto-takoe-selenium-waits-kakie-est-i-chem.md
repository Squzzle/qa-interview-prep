---
id: chto-takoe-selenium-waits-kakie-est-i-chem
title: "Selenium Waits виды и отличия"
sidebar_position: 4
tags: ["AQA — Selenium"]
---

# Что такое Selenium Waits? Какие есть и чем отличаются?

**Коротко:** Waits — это механизмы синхронизации теста с состоянием страницы, которые заставляют Selenium ждать, пока элемент станет доступен, прежде чем с ним взаимодействовать; основные виды — implicit, explicit и fluent wait.

## Развёрнутый ответ

Веб-страницы часто загружают контент асинхронно (AJAX-запросы, анимации, ленивая загрузка), поэтому элемент может физически ещё не появиться в DOM в момент, когда тест пытается его найти. Без ожиданий тест падает с `NoSuchElementException` или `ElementNotInteractableException`. Waits решают эту проблему.

**1. Implicit Wait (неявное ожидание)**
Устанавливается один раз на весь `WebDriver` и применяется глобально ко всем вызовам `findElement`. Если элемент не найден сразу, драйвер будет повторять попытки поиска в течение заданного времени, прежде чем бросить исключение.

```java
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
```

Недостаток: неявное ожидание работает только на этапе поиска элемента в DOM, но не проверяет его видимость, кликабельность или другие условия. Также смешивание implicit и explicit wait в одном тесте может приводить к непредсказуемым задержкам (известная проблема — суммарное время ожидания может расти непредсказуемо).

**2. Explicit Wait (явное ожидание)**
Применяется к конкретному элементу и конкретному условию через `WebDriverWait` и `ExpectedConditions`. Более гибкий и предсказуемый инструмент — можно ждать не только наличия в DOM, но и видимости, кликабельности, изменения текста и т.д.

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement button = wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));
button.click();
```

**3. Fluent Wait**
Расширенная версия explicit wait, позволяющая настроить:
- частоту опроса (polling interval) — как часто проверять условие;
- список исключений, которые нужно игнорировать во время ожидания (например, `NoSuchElementException`);
- общий таймаут.

```java
Wait<WebDriver> fluentWait = new FluentWait<>(driver)
        .withTimeout(Duration.ofSeconds(15))
        .pollingEvery(Duration.ofMillis(500))
        .ignoring(NoSuchElementException.class);

WebElement element = fluentWait.until(d -> d.findElement(By.id("dynamicElement")));
```

**Ключевые отличия:**

| Тип | Область действия | Гибкость условий | Частота опроса |
|---|---|---|---|
| Implicit | Весь драйвер (глобально) | Только "элемент найден в DOM" | Фиксированная (default ~500мс) |
| Explicit | Конкретный элемент/условие | Любое условие из `ExpectedConditions` | Фиксированная |
| Fluent | Конкретный элемент/условие | Любое условие + игнорирование исключений | Настраиваемая |

Отдельно стоит упомянуть **Thread.sleep()** — жёсткую паузу без проверки условий. Это антипаттерн: либо тест ждёт дольше необходимого (замедляет прогон), либо недостаточно (тест становится нестабильным, "flaky"). Использовать `Thread.sleep()` в продакшн-автотестах считается плохой практикой.

Также важно знать: **нельзя одновременно использовать implicit и explicit wait** в рамках одного драйвера/теста без осторожности — это официально не рекомендуется документацией Selenium из-за непредсказуемого суммирования таймаутов.

## Пример / когда применяется

Explicit wait для ожидания появления модального окна после клика:

```java
driver.findElement(By.id("openModalBtn")).click();

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("modal")));
```

Fluent wait применяется, когда элемент появляется нерегулярно и нужно игнорировать промежуточные исключения, например при поллинге результата асинхронной операции (загрузка отчёта, генерация PDF на бэкенде).

## На что смотрит интервьюер

- Знает ли кандидат все три вида ожиданий и может чётко их различить, а не путает implicit с explicit.
- Понимает ли, почему смешивание implicit и explicit wait — плохая практика.
- Считает ли `Thread.sleep()` антипаттерном и может объяснить почему.
- Может ли привести реальные `ExpectedConditions` (`visibilityOf`, `elementToBeClickable`, `presenceOfElementLocated`, `textToBePresentInElement`).
- Красный флаг: если кандидат говорит, что всегда достаточно `Thread.sleep(3000)` — это явный признак отсутствия опыта с нестабильными (flaky) тестами.
