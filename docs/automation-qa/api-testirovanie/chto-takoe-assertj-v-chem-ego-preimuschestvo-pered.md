---
id: chto-takoe-assertj-v-chem-ego-preimuschestvo-pered
title: "AssertJ и его преимущества"
sidebar_position: 10
tags: ["API-тестирование"]
---

# Что такое AssertJ? В чем его преимущество перед стандартными asserts JUnit?

**Коротко:** AssertJ — библиотека fluent-ассертов для Java, позволяющая писать читаемые цепочки проверок (`assertThat(x).isEqualTo(y).hasSize(3)`), с богатым набором методов для коллекций, строк, дат и объектов, а также с понятными сообщениями об ошибках.

## Развёрнутый ответ

Стандартные асserts JUnit (`assertEquals(expected, actual)`, `assertTrue(condition)`) выполняют свою задачу, но имеют ряд ограничений:

- порядок аргументов `expected`/`actual` легко перепутать, что даёт запутанное сообщение об ошибке;
- ограниченный набор методов — для сложных проверок (например, коллекций, объектов, дат) нужно писать дополнительный код;
- сообщения об ошибках часто малоинформативны.

**AssertJ** решает эти проблемы, предоставляя fluent API (цепочку вызовов), которая:

- начинается с единой точки входа `assertThat(actual)`, что устраняет путаницу с порядком аргументов;
- позволяет объединять несколько проверок в одну цепочку: `assertThat(user).hasFieldOrPropertyWithValue("name", "Иван").hasFieldOrPropertyWithValue("age", 30)`;
- предоставляет специализированные ассерты для разных типов данных: строк (`startsWith`, `contains`, `matches`), коллекций (`hasSize`, `containsExactly`, `contains`, `extracting`), дат (`isBefore`, `isAfter`), объектов (`isEqualToComparingFieldByField`, `usingRecursiveComparison`), исключений (`assertThatThrownBy`);
- даёт значительно более понятные и подробные сообщения об ошибках (показывает, что ожидалось, что получено, и в чём разница, например, для коллекций — какие элементы отсутствуют/лишние);
- поддерживает "мягкие" проверки через `SoftAssertions`, позволяющие собрать несколько ошибок за один прогон теста, вместо остановки на первой же непройденной проверке;
- расширяема — можно писать собственные кастомные ассерты для доменных объектов проекта.

В API-тестировании AssertJ особенно полезен при проверке сложных ответов: списков объектов, вложенных полей, что делает тесты компактнее и понятнее по сравнению со стандартными `assertEquals`.

## Пример / когда применяется

Сравнение JUnit vs AssertJ:

```java
// JUnit
assertEquals(3, users.size());
assertTrue(users.get(0).getName().equals("Иван"));

// AssertJ
assertThat(users)
    .hasSize(3)
    .extracting(User::getName)
    .contains("Иван", "Пётр");
```

Проверка исключения:

```java
assertThatThrownBy(() -> service.findUser(-1))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("id должен быть положительным");
```

Soft assertions — сбор нескольких ошибок:

```java
SoftAssertions softly = new SoftAssertions();
softly.assertThat(response.statusCode()).isEqualTo(200);
softly.assertThat(response.jsonPath().getString("name")).isEqualTo("Иван");
softly.assertAll(); // покажет ВСЕ ошибки сразу, а не только первую
```

## На что смотрит интервьюер

- Понимание конкретных преимуществ AssertJ, а не общей фразы "он удобнее".
- Знание метода `assertThat()` как единой точки входа и умение привести пример цепочки проверок.
- Знание `SoftAssertions` и того, зачем они нужны (сбор всех ошибок за один прогон вместо падения на первой).
- Красный флаг: если кандидат не может объяснить разницу между "жёсткими" и "мягкими" ассертами или путает AssertJ с Hamcrest.
- Follow-up: "Как использовать `extracting()` для проверки конкретного поля списка объектов?", "Чем `usingRecursiveComparison()` отличается от обычного `isEqualTo()`?".
