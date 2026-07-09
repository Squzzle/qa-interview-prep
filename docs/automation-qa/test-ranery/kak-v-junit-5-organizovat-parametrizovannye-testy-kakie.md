---
id: kak-v-junit-5-organizovat-parametrizovannye-testy-kakie
title: "Параметризованные тесты в JUnit 5"
sidebar_position: 3
tags: ["Тест-раннеры"]
---

# Как в JUnit 5 организовать параметризованные тесты? Какие аннотации для этого используются (`@ParameterizedTest`, `@ValueSource`, `@CsvSource`)?

**Коротко:** параметризованные тесты в JUnit 5 создаются аннотацией `@ParameterizedTest` вместо `@Test`, а источник данных для повторного запуска задаётся дополнительными аннотациями — `@ValueSource`, `@CsvSource`, `@MethodSource`, `@EnumSource`, `@CsvFileSource` и другими.

## Развёрнутый ответ

Параметризованный тест — это один тестовый метод, который JUnit выполняет несколько раз с разными наборами входных данных, что позволяет не дублировать код теста для проверки разных сценариев (граничные значения, невалидные данные, разные комбинации входов).

Для работы параметризованных тестов нужна отдельная зависимость `junit-jupiter-params`. Основной механизм:

- **`@ParameterizedTest`** — заменяет `@Test`, сообщает раннеру, что метод будет вызван несколько раз с разными аргументами.
- **`@ValueSource(strings = {...}, ints = {...}, ...)`** — простой источник данных: массив примитивов или строк, каждый элемент — отдельный запуск с одним аргументом.
- **`@CsvSource({"a, 1", "b, 2"})`** — задаёт несколько аргументов на строку в формате CSV прямо в аннотации; удобно для методов с несколькими параметрами.
- **`@CsvFileSource(resources = "/data.csv")`** — то же самое, но данные берутся из внешнего CSV-файла (удобно при большом объёме данных).
- **`@MethodSource("methodName")`** — данные поставляет статический метод, возвращающий `Stream`, `Collection`, `Iterable` или `Arguments`; используется, когда нужно передавать сложные объекты, а не примитивы.
- **`@EnumSource(MyEnum.class)`** — источник данных — значения перечисления (enum).
- **`@ArgumentsSource(CustomProvider.class)`** — кастомный провайдер аргументов, реализующий интерфейс `ArgumentsProvider`, для сложной логики генерации данных.

Для нескольких параметров одновременно используется класс `Arguments.of(...)` (обычно вместе с `@MethodSource`), а метод-источник должен возвращать `Stream<Arguments>`.

Также можно использовать `@DisplayName` с плейсхолдерами (`{0}`, `{1}`, `{arguments}`) для читаемых имён каждого прогона в отчёте.

## Пример / когда применяется

Пример с `@ValueSource`:

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "  "})
void shouldFailOnBlankStrings(String input) {
    Assertions.assertTrue(input.isBlank());
}
```

Пример с `@CsvSource` для нескольких аргументов:

```java
@ParameterizedTest
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "10, -10, 0"
})
void addition_shouldReturnSum(int a, int b, int expected) {
    Assertions.assertEquals(expected, a + b);
}
```

Пример с `@MethodSource` для сложных объектов:

```java
@ParameterizedTest
@MethodSource("userProvider")
void validateUser(User user, boolean expectedValid) {
    Assertions.assertEquals(expectedValid, UserValidator.isValid(user));
}

static Stream<Arguments> userProvider() {
    return Stream.of(
        Arguments.of(new User("Ivan", 25), true),
        Arguments.of(new User("", 25), false),
        Arguments.of(new User("Ivan", -1), false)
    );
}
```

Применяется, когда нужно проверить один и тот же метод/сценарий на множестве входных данных: граничные значения, эквивалентные классы, невалидные данные, разные локали и т.д.

## На что смотрит интервьюер

- Знает ли кандидат разницу между простыми источниками (`@ValueSource`) и сложными (`@MethodSource`, `@CsvSource`).
- Понимает ли, зачем вообще нужна параметризация — уменьшение дублирования кода и повышение покрытия граничных случаев.
- Может ли объяснить, как передать несколько параметров одновременно.
- Частая ошибка — попытка использовать `@ValueSource` с несколькими типами данных сразу или для сложных объектов (он поддерживает только один примитивный тип за раз).
- Follow-up вопрос — как совместить параметризацию с `@BeforeEach` и общим состоянием теста, или как задать читаемое имя для каждого набора параметров в отчёте.
