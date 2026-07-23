---
id: kakie-assertions-est-v-testng-junit
title: "Виды assertions в TestNG и JUnit"
sidebar_position: 3
tags: ["AQA — TestNG/JUnit, Git, CI"]
---

# Какие assertions есть в TestNG/JUnit?

**Коротко:** Assertions (утверждения) — методы проверки соответствия фактического результата ожидаемому; оба фреймворка предоставляют статические методы классов `Assert`/`Assertions` (`assertEquals`, `assertTrue`, `assertNull` и т.д.), а также поддерживают "мягкие" проверки (soft assertions), которые не прерывают тест сразу при первом несовпадении.

## Развёрнутый ответ

Assertion — это точка в тесте, где мы явно сравниваем фактическое поведение системы с ожидаемым. Если условие не выполняется, assertion выбрасывает исключение (`AssertionError`), и тест помечается как упавший (failed).

В TestNG проверки собраны в классе `org.testng.Assert` и включают:
- `assertEquals(actual, expected)` / `assertNotEquals` — сравнение значений (важно: у TestNG порядок аргументов `actual, expected`).
- `assertTrue` / `assertFalse` — проверка булевого условия.
- `assertNull` / `assertNotNull` — проверка на null.
- `assertSame` / `assertNotSame` — сравнение по ссылке (identity), а не по `equals`.
- `assertThrows` — проверка, что код выбрасывает ожидаемое исключение.
- **Soft assertions** — класс `SoftAssert`: позволяет накопить несколько несовпадений за один прогон теста и вызвать `assertAll()` в конце, который "разом" сообщит обо всех найденных ошибках, вместо прерывания на первой же проверке.

В JUnit (Jupiter, версия 5) проверки собраны в классе `org.junit.jupiter.api.Assertions` и включают похожий набор:
- `assertEquals(expected, actual)` — здесь порядок обратный TestNG: сначала ожидаемое, потом фактическое.
- `assertTrue` / `assertFalse`, `assertNull` / `assertNotNull`, `assertSame` / `assertNotSame`.
- `assertThrows` — проверка исключений с возможностью проверить сообщение и тип.
- `assertAll` — группировка нескольких проверок так, чтобы увидеть все упавшие сразу (аналог soft assertions по эффекту, но по механике это "collecting assertions" внутри одного вызова, а не отдельный объект-накопитель).
- `assertTimeout` / `assertTimeoutPreemptively` — проверка, что код укладывается во временной лимит.

Принципиальная разница в подходе: обычные (hard) assertions в обоих фреймворках прерывают выполнение теста немедленно при первом несовпадении — оставшийся код теста не выполняется. Soft assertions (TestNG `SoftAssert`) или `assertAll` (JUnit) позволяют собрать все ошибки за один прогон и получить полную картину, что удобно для UI-тестов, где проверяется сразу много элементов на странице.

Также стоит помнить о сторонних библиотеках assertions, которые часто используют поверх TestNG/JUnit — например, AssertJ (`assertThat(actual).isEqualTo(expected)`) с более читаемым fluent API и более информативными сообщениями об ошибках.

## Пример / когда применяется

```java
// TestNG hard assertion
Assert.assertEquals(actualTitle, "Ожидаемый заголовок");

// TestNG soft assertion
SoftAssert softAssert = new SoftAssert();
softAssert.assertEquals(actualTitle, "Ожидаемый заголовок");
softAssert.assertTrue(isButtonVisible);
softAssert.assertAll(); // здесь будут собраны все ошибки сразу
```

```java
// JUnit 5 hard assertion
assertEquals("Ожидаемый заголовок", actualTitle);

// JUnit 5 группировка проверок
assertAll("страница логина",
    () -> assertEquals("Ожидаемый заголовок", actualTitle),
    () -> assertTrue(isButtonVisible)
);
```

Soft assertions особенно полезны в UI-автотестах: если на странице проверяется 10 элементов, а первый же `assertTrue` падает, hard assertion остановит тест и скроет остальные 9 проблем — soft assertion покажет их все за один прогон.

## На что смотрит интервьюер

Интервьюер часто уточняет порядок аргументов в `assertEquals` (TestNG: `actual, expected`; JUnit: `expected, actual`) — путаница здесь встречается очень часто и приводит к нечитаемым сообщениям об ошибках. Второй частый вопрос — в чём разница между hard и soft assertions и когда какие использовать (soft — для проверки множества независимых условий без остановки на первой ошибке; hard — когда дальнейшее выполнение теста без выполнения условия не имеет смысла). Плюсом будет знание о необходимости вызывать `assertAll()` у `SoftAssert` — без этого вызова накопленные ошибки не "всплывут", и тест ошибочно будет считаться пройденным.
