---
id: napishite-avtomaticheskie-testovye-scenarii-dlya-proverki-ap
title: "Автотесты API GitHub Gists и CI"
sidebar_position: 19
tags: ["Практические задания"]
---

# Напишите автоматические тестовые сценарии для проверки API операций создания и просмотра GitHub Gists. Интегрируйте ваш проект с известной вам CI-системой.

**Коротко:** решение — набор автотестов на RestAssured/Java (или supertest/JS), проверяющих создание (`POST /gists`) и получение (`GET /gists/{id}`) gist с позитивными и негативными кейсами, обёрнутый в Maven/Gradle-проект и интегрированный в GitHub Actions с запуском на каждый push/pull request.

## Развёрнутый ответ

GitHub предоставляет REST API для работы с Gists: `POST https://api.github.com/gists` для создания и `GET https://api.github.com/gists/{gist_id}` для просмотра. Для создания приватных/публичных gist через API требуется Personal Access Token (аутентификация через заголовок `Authorization: Bearer <token>`), для публичных gist чтение возможно без токена (с ограничением по rate limit).

**Структура тестового набора:**

1. **Позитивные кейсы:**
   - Создание публичного gist с валидным телом (`description`, `public: true`, `files`) — ожидаем `201 Created`, в ответе есть `id`, `html_url`, содержимое файла совпадает с отправленным.
   - Создание приватного gist (`public: false`) — проверка, что gist создан и помечен как приватный.
   - Получение созданного gist по `id` — ожидаем `200 OK`, содержимое файла совпадает с тем, что было отправлено при создании.

2. **Негативные кейсы:**
   - Создание gist без обязательного поля `files` — ожидаем `422 Unprocessable Entity`.
   - Создание gist без авторизации (без токена) — публичный gist в реальном API GitHub может создаться как "анонимный" либо вернуть ошибку в зависимости от версии API — это нужно явно проверить и задокументировать поведение.
   - Получение несуществующего gist (случайный/несуществующий id) — ожидаем `404 Not Found`.
   - Использование невалидного/просроченного токена — ожидаем `401 Unauthorized`.
   - Превышение rate limit (много запросов подряд без аутентификации) — ожидаем `403 Forbidden` с заголовком `X-RateLimit-Remaining: 0`.

3. **Проверка структуры ответа (JSON Schema Validation)** — соответствие полей `id`, `description`, `public`, `files`, `owner`, `created_at` ожидаемым типам.

**Технологический стек:** Java + RestAssured + JUnit 5 + Maven, конфигурация токена через переменные окружения (никогда не хардкодить токен в коде).

## Пример / когда применяется

Пример реализации тестов (Java, RestAssured, JUnit 5):

```java
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class GistApiTest {

    private static String token;
    private static String createdGistId;

    @BeforeAll
    static void setup() {
        RestAssured.baseURI = "https://api.github.com";
        token = System.getenv("GITHUB_TOKEN");
    }

    @Test
    void shouldCreatePublicGist() {
        String body = """
            {
              "description": "Test gist created by automated test",
              "public": true,
              "files": {
                "test.txt": { "content": "Hello, automated test!" }
              }
            }
            """;

        createdGistId = given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/gists")
        .then()
            .statusCode(201)
            .body("public", equalTo(true))
            .body("files.'test.txt'.content", equalTo("Hello, automated test!"))
            .extract().path("id");
    }

    @Test
    void shouldRetrieveCreatedGist() {
        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/gists/{id}", createdGistId)
        .then()
            .statusCode(200)
            .body("id", equalTo(createdGistId));
    }

    @Test
    void shouldReturn404ForNonExistentGist() {
        given()
        .when()
            .get("/gists/{id}", "nonexistent12345")
        .then()
            .statusCode(404);
    }

    @Test
    void shouldReturn401WithInvalidToken() {
        given()
            .header("Authorization", "Bearer invalid_token_123")
            .contentType(ContentType.JSON)
            .body("{\"public\": true, \"files\": {\"a.txt\": {\"content\": \"x\"}}}")
        .when()
            .post("/gists")
        .then()
            .statusCode(401);
    }
}
```

Интеграция с CI-системой GitHub Actions (`.github/workflows/api-tests.yml`):

```yaml
name: API Tests - GitHub Gists

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Run API tests
        env:
          GITHUB_TOKEN: ${{ secrets.GIST_TEST_TOKEN }}
        run: mvn clean test

      - name: Publish test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: target/surefire-reports
```

Токен хранится в GitHub Secrets (`GIST_TEST_TOKEN`), пайплайн запускается на каждый push и pull request в `main`, отчёты публикуются как артефакт для последующего анализа.

## На что смотрит интервьюер

Интервьюер оценивает практическое владение фреймворком для API-тестирования (RestAssured/аналог), понимание особенностей конкретного API (rate limiting, аутентификация через токен), а также умение настроить реальный CI-пайплайн (не просто "я бы использовал Jenkins", а конкретный YAML/конфигурация). Важно, что токен не хардкодится в коде, а хранится в секретах CI. Красный флаг — тесты без негативных кейсов, отсутствие изоляции тестовых данных (например, не удаляются созданные тестовые gist), хардкод токена в открытом виде. Частые follow-up: "Как вы очищаете тестовые данные (удаление созданных gist после тестов)?", "Как избежать rate limiting при частом запуске CI?", "Как бы вы распараллелили тесты в CI для ускорения?".
