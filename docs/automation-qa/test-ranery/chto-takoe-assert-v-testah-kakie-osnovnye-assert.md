---
id: chto-takoe-assert-v-testah-kakie-osnovnye-assert
title: "Assert-методы в JUnit 5"
sidebar_position: 4
tags: ["Тест-раннеры"]
---

# Что такое `assert` в тестах? Какие основные assert-методы вы знаете в JUnit 5 (`assertEquals`, `assertTrue`, `assertThrows`)?

**Коротко:** assert — это утверждение, проверяющее, что фактический результат соответствует ожидаемому; если проверка не проходит, тест немедленно падает с `AssertionError` и понятным сообщением об отличии ожидаемого от фактического значения.

## Развёрнутый ответ

Assert (утверждение) — базовый механизм проверки в автоматизированном тестировании. Метод `assert*` сравнивает фактическое поведение/значение с ожидаемым и, если условие не выполняется, выбрасывает исключение (`AssertionError` в JUnit), которое прерывает выполнение теста и помечает его как упавший (failed). В отличие от обычного `if`, assert-методы стандартизированы, дают единообразные сообщения об ошибке и интегрированы с отчётностью тест-раннера.

В JUnit 5 все статические методы находятся в классе `org.junit.jupiter.api.Assertions`. Основные:

- **`assertEquals(expected, actual)`** — проверяет равенство двух значений (по `equals()`); есть перегрузка с сообщением об ошибке и с delta для чисел с плавающей точкой.
- **`assertNotEquals(unexpected, actual)`** — проверяет, что значения не равны.
- **`assertTrue(condition)`** / **`assertFalse(condition)`** — проверяет булево условие.
- **`assertNull(obj)`** / **`assertNotNull(obj)`** — проверка на null.
- **`assertSame(expected, actual)`** / **`assertNotSame(...)`** — сравнение по ссылке (`==`), а не по `equals()`.
- **`assertArrayEquals(expectedArray, actualArray)`** — поэлементное сравнение массивов.
- **`assertIterableEquals(...)`** — сравнение коллекций/итерируемых объектов.
- **`assertThrows(ExceptionClass.class, executable)`** — проверяет, что выполнение кода выбрасывает ожидаемое исключение; возвращает само исключение для дальнейших проверок (например, сообщения).
- **`assertDoesNotThrow(executable)`** — проверяет, что код не выбрасывает никаких исключений.
- **`assertTimeout(duration, executable)`** — проверяет, что код выполняется за указанное время.
- **`assertAll(...)`** — группирует несколько проверок так, что все они выполняются, а не останавливаются на первой ошибке (см. отдельный вопрос).
- **`fail("сообщение")`** — принудительно проваливает тест с заданным сообщением (например, если код дошёл до места, которое не должен достигать).

У большинства методов есть перегрузка с дополнительным параметром — сообщением об ошибке (`String` или `Supplier<String>`), которое выводится, если проверка не прошла — это упрощает диагностику падений в отчётах.

## Пример / когда применяется

```java
@Test
void divisionByZeroThrowsException() {
    Calculator calculator = new Calculator();

    ArithmeticException exception = Assertions.assertThrows(
        ArithmeticException.class,
        () -> calculator.divide(10, 0)
    );

    Assertions.assertEquals("/ by zero", exception.getMessage());
}

@Test
void userIsCreatedCorrectly() {
    User user = new User("Ivan", 25);

    Assertions.assertEquals("Ivan", user.getName(), "Имя пользователя не совпадает");
    Assertions.assertTrue(user.getAge() > 18, "Пользователь должен быть совершеннолетним");
    Assertions.assertNotNull(user.getId());
}
```

Assert-методы применяются в конце каждого теста (или после действия, результат которого нужно проверить) — это финальный шаг паттерна Arrange-Act-Assert.

## На что смотрит интервьюер

- Знает ли кандидат разницу между `assertEquals` (по значению) и `assertSame` (по ссылке).
- Умеет ли использовать `assertThrows` для проверки исключений, а не оборачивать код в try/catch вручную.
- Понимает ли порядок аргументов в `assertEquals(expected, actual)` — частая ошибка перепутать местами, из-за чего сообщение об ошибке будет вводить в заблуждение.
- Знает ли о существовании библиотек matcher'ов (AssertJ, Hamcrest) как альтернативы/дополнению к встроенным assert JUnit — хороший follow-up.
- Красный флаг — использование только `assertTrue` для всех проверок вместо специализированных методов (`assertEquals`, `assertThrows` и т.д.), что даёт менее информативные сообщения об ошибках.
