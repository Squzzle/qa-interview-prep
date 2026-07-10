---
id: kakie-expected-conditions-vy-znaete-visibilityofelementlocat
title: "Виды Expected Conditions в Selenium"
sidebar_position: 10
tags: ["Инициализация браузера и Selenium"]
---

# Какие Expected Conditions вы знаете (`visibilityOfElementLocated`, `elementToBeClickable`, `alertIsPresent`)?

**Коротко:** `ExpectedConditions` — это набор статических фабричных методов, возвращающих условие для использования внутри `WebDriverWait.until()`; они покрывают ожидание видимости, кликабельности, присутствия в DOM, текста, alert-ов, переключения фреймов и множество других типовых ситуаций синхронизации.

## Развёрнутый ответ

Класс `org.openqa.selenium.support.ui.ExpectedConditions` содержит десятки готовых условий. Наиболее часто используемые в интервью и на практике:

**Условия по присутствию/видимости элемента:**
- `presenceOfElementLocated(By locator)` — элемент есть в DOM (не обязательно видим).
- `visibilityOfElementLocated(By locator)` — элемент есть в DOM И видим (имеет ненулевые размеры, не `display:none`).
- `visibilityOf(WebElement element)` — то же самое, но для уже найденного элемента.
- `invisibilityOfElementLocated(By locator)` — элемент отсутствует в DOM или невидим (часто используется для ожидания исчезновения спиннера/лоадера).
- `presenceOfAllElementsLocatedBy(By locator)` / `visibilityOfAllElementsLocatedBy(By locator)` — списки элементов.

**Условия по интерактивности:**
- `elementToBeClickable(By locator)` — элемент видим и `enabled` (доступен для клика).
- `elementToBeSelected(WebElement element)` — для чекбоксов/радиокнопок.
- `elementSelectionStateToBe(WebElement element, boolean selected)`.

**Условия по тексту/атрибутам:**
- `textToBePresentInElement(WebElement element, String text)` / `textToBePresentInElementLocated(By locator, String text)`.
- `attributeToBe(By locator, String attribute, String value)`.

**Условия по alert/confirm/prompt:**
- `alertIsPresent()` — возвращает объект `Alert`, когда нативный диалог появился; используется перед `driver.switchTo().alert()`.

**Условия по фреймам/окнам:**
- `frameToBeAvailableAndSwitchToIt(By locator)` — ждёт появления фрейма и сразу переключает на него контекст.
- `numberOfWindowsToBe(int expectedNumber)` — ждёт открытия/закрытия дополнительной вкладки.

**Условия по URL/заголовку:**
- `urlContains(String fraction)`, `urlToBe(String url)`, `titleIs(String title)`, `titleContains(String title)`.

**Условия по staleness:**
- `stalenessOf(WebElement element)` — ждёт, пока элемент "устареет" (будет удалён из DOM), полезно после действий, вызывающих перерисовку страницы.

Все эти методы возвращают объект типа `ExpectedCondition<T>` — по сути функциональный интерфейс с методом `apply(WebDriver driver)`, что позволяет при необходимости писать собственные кастомные условия через лямбду:

```java
wait.until(driver -> driver.findElements(By.cssSelector(".item")).size() > 5);
```

## Пример / когда применяется

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

// ожидание кликабельности кнопки перед кликом
wait.until(ExpectedConditions.elementToBeClickable(By.id("login-btn"))).click();

// ожидание исчезновения спиннера загрузки
wait.until(ExpectedConditions.invisibilityOfElementLocated(By.className("spinner")));

// работа с alert
wait.until(ExpectedConditions.alertIsPresent());
driver.switchTo().alert().accept();

// ожидание появления фрейма и переключение в него
wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("payment-frame")));
```

Такие условия применяются практически на каждом шаге взаимодействия с динамическим UI: перед кликом, перед вводом текста, при ожидании AJAX-результатов, при работе с модальными окнами и всплывающими системными диалогами.

## На что смотрит интервьюер

- Знание разницы между `presenceOfElementLocated` и `visibilityOfElementLocated` (в DOM vs видим) — частый вопрос-ловушка.
- Понимание, что `elementToBeClickable` включает в себя проверку видимости и `enabled`-состояния.
- Умение написать кастомное условие через лямбду, когда готового `ExpectedConditions` недостаточно.
- Практический опыт работы с `alertIsPresent()` и переключением на алерт.
- Красный флаг: если кандидат знает только 1-2 условия и не может объяснить смысловую разницу между похожими методами.
