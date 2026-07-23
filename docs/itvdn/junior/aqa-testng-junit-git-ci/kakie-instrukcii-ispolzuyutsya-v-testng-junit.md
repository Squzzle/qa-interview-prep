---
id: kakie-instrukcii-ispolzuyutsya-v-testng-junit
title: "Аннотации жизненного цикла тестов"
sidebar_position: 2
tags: ["AQA — TestNG/JUnit, Git, CI"]
---

# Какие инструкции используются в TestNG/JUnit?

**Коротко:** Речь идёт об аннотациях жизненного цикла тестов — они описывают, какие методы являются тестами, а какие выполняются до/после отдельного теста или всего набора тестов (класса, набора, группы).

## Развёрнутый ответ

И TestNG, и JUnit используют аннотации (annotations) для управления порядком выполнения кода вокруг тестов. Это позволяет вынести подготовку окружения (setup) и его очистку (teardown) в отдельные методы, не смешивая их с логикой самого теста.

В TestNG основные аннотации:
- `@Test` — помечает метод как тестовый.
- `@BeforeMethod` / `@AfterMethod` — выполняются перед/после каждого тестового метода.
- `@BeforeClass` / `@AfterClass` — один раз перед/после всех тестов текущего класса.
- `@BeforeSuite` / `@AfterSuite` — один раз перед/после выполнения всего набора (suite), описанного в `testng.xml`.
- `@BeforeGroups` / `@AfterGroups` — перед/после выполнения тестов конкретной группы.
- `@BeforeTest` / `@AfterTest` — привязаны к тегу `<test>` внутри `testng.xml` (промежуточный уровень между suite и классом).
- `@DataProvider` — источник параметров для параметризованных тестов.
- `@Factory` — создание нескольких экземпляров тестового класса с разными параметрами.

В JUnit (версия 5 / Jupiter) аналогичный набор аннотаций:
- `@Test` — тестовый метод.
- `@BeforeEach` / `@AfterEach` — перед/после каждого теста (аналог `@BeforeMethod`/`@AfterMethod`).
- `@BeforeAll` / `@AfterAll` — один раз перед/после всех тестов класса (методы должны быть статическими, если не используется `@TestInstance(Lifecycle.PER_CLASS)`).
- `@ParameterizedTest` вместе с `@ValueSource`, `@CsvSource`, `@MethodSource` и т.п. — параметризация.
- `@Disabled` — временное отключение теста.
- `@Tag` — группировка тестов (аналог групп в TestNG).
- `@Nested` — вложенные классы тестов для группировки сценариев.

В JUnit 4 (устаревшая, но всё ещё встречающаяся версия) названия отличаются: `@Before`, `@After`, `@BeforeClass`, `@AfterClass`, `@Ignore`, `@RunWith`.

Важный нюанс: порядок выполнения `@Before*`/`@After*` методов внутри одного уровня не гарантирован разработчиком явно (если их несколько), а между уровнями всегда соблюдается вложенность: suite → test → class → method.

## Пример / когда применяется

```java
// TestNG
public class UserServiceTest {

    @BeforeSuite
    public void initDb() { /* поднять тестовую БД */ }

    @BeforeClass
    public void createService() { /* создать сервис один раз для класса */ }

    @BeforeMethod
    public void resetState() { /* сбросить состояние перед каждым тестом */ }

    @Test(groups = "regression")
    public void shouldCreateUser() { /* ... */ }

    @AfterMethod
    public void cleanupState() { /* ... */ }

    @AfterClass
    public void closeService() { /* ... */ }

    @AfterSuite
    public void shutdownDb() { /* ... */ }
}
```

```java
// JUnit 5
class UserServiceTest {

    @BeforeAll
    static void createService() { /* один раз для класса */ }

    @BeforeEach
    void resetState() { /* перед каждым тестом */ }

    @Test
    @Tag("regression")
    void shouldCreateUser() { /* ... */ }

    @AfterEach
    void cleanupState() { /* ... */ }

    @AfterAll
    static void closeService() { /* ... */ }
}
```

## На что смотрит интервьюер

Кандидат должен уверенно назвать соответствия между аннотациями TestNG и JUnit и объяснить порядок их выполнения (suite → class → method), а не просто перечислить названия. Частая ошибка — путаница между `@BeforeClass` в TestNG (не требует `static`) и `@BeforeClass` в JUnit 4 (требует `static`). Плюсом будет упоминание `@BeforeAll`/`@AfterAll` в JUnit 5 и особенности `@TestInstance(Lifecycle.PER_CLASS)`, а также практическое понимание, зачем разносить подготовку по уровням (производительность против изоляции тестов).
