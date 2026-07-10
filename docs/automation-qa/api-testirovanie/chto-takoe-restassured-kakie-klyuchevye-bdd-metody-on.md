---
id: chto-takoe-restassured-kakie-klyuchevye-bdd-metody-on
title: "RestAssured и его BDD-методы"
sidebar_position: 6
tags: ["API-тестирование"]
---

# Что такое RestAssured? Какие ключевые BDD-методы он предоставляет (`given()`, `when()`, `then()`)?

**Коротко:** RestAssured — Java-библиотека для тестирования REST API, предоставляющая DSL в BDD-стиле (`given()/when()/then()`), которая позволяет декларативно задавать запрос, выполнять его и проверять ответ в одном читаемом чейне вызовов.

## Развёрнутый ответ

RestAssured — популярная open-source Java-библиотека, специально разработанная для тестирования HTTP/REST API. Она упрощает написание тестов, скрывая низкоуровневую работу с HTTP-клиентом и предоставляя удобный fluent-интерфейс, вдохновлённый синтаксисом BDD (Given-When-Then из Cucumber/Gherkin).

**Ключевые методы:**

- **`given()`** — блок подготовки запроса: здесь задаются заголовки (`.header()`), параметры (`.queryParam()`, `.pathParam()`), тело запроса (`.body()`), контент-тайп (`.contentType()`), аутентификация (`.auth()`), cookies и т.д.
- **`when()`** — блок выполнения самого HTTP-запроса: указывается метод и эндпоинт — `.get()`, `.post()`, `.put()`, `.delete()`, `.patch()`.
- **`then()`** — блок проверки ответа: здесь идут ассерты — `.statusCode()`, `.body()`, `.header()`, `.time()` и другие проверки через встроенный matcher (Hamcrest) или JsonPath/XmlPath выражения.

Дополнительные возможности RestAssured:

- встроенная поддержка JsonPath и XmlPath для извлечения данных из ответа без ручного парсинга;
- интеграция со схема-валидацией (`matchesJsonSchemaInClasspath`) для проверки структуры JSON по JSON Schema;
- поддержка спецификаций запросов/ответов (`RequestSpecification`/`ResponseSpecification`) для переиспользования общих настроек;
- логирование запроса/ответа (`.log().all()`, `.log().ifValidationFails()`) для отладки;
- интеграция с authentication-механизмами: Basic Auth, OAuth2, digest;
- работа с multipart-запросами (загрузка файлов).

RestAssured хорошо сочетается с JUnit/TestNG как раннером тестов и с Allure/ExtentReports для отчётности.

## Пример / когда применяется

```java
given()
    .contentType(ContentType.JSON)
    .header("Authorization", "Bearer " + token)
    .body(new UserRequest("Иван", "ivan@example.com"))
.when()
    .post("/api/users")
.then()
    .statusCode(201)
    .body("name", equalTo("Иван"))
    .body("email", equalTo("ivan@example.com"))
    .time(lessThan(2000L));
```

Такой тест применяется при проверке любых CRUD-операций API: создании пользователя, получении списка заказов, обновлении данных и т.д. — он читается почти как естественно-языковой сценарий: "дано (given) тело запроса и токен, когда (when) отправляем POST, тогда (then) статус должен быть 201, а поля соответствовать ожидаемым".

## На что смотрит интервьюер

- Понимание назначения каждого из трёх блоков (given/when/then), а не просто их перечисление.
- Знание, что RestAssured использует Hamcrest matcher'ы и JsonPath/XmlPath под капотом.
- Умение написать простой тест "с листа" на собеседовании (проверка статус-кода и поля из тела ответа).
- Красный флаг: если кандидат не может объяснить разницу между `when()` и `then()`, или не знает, как задать заголовки в `given()`.
- Follow-up: "Как проверить JSON-схему ответа?", "Как переиспользовать конфигурацию запроса между тестами через `RequestSpecification`?".
