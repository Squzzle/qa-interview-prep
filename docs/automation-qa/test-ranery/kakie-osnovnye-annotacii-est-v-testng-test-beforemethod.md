---
id: kakie-osnovnye-annotacii-est-v-testng-test-beforemethod
title: "Основные аннотации TestNG"
sidebar_position: 7
tags: ["Тест-раннеры"]
---

# Какие основные аннотации есть в TestNG (`@Test`, `@BeforeMethod`, `@BeforeClass`, `@BeforeSuite`)?

**Коротко:** TestNG предоставляет более гранулярную иерархию хуков жизненного цикла, чем JUnit — уровни method, class, test (из XML), suite — с аннотациями `@Test`, `@BeforeMethod`/`@AfterMethod`, `@BeforeClass`/`@AfterClass`, `@BeforeTest`/`@AfterTest`, `@BeforeSuite`/`@AfterSuite`, а также поддержкой групп, приоритетов и зависимостей прямо в аннотации `@Test`.

## Развёрнутый ответ

TestNG (пакет `org.testng.annotations`) предлагает более детализированную иерархию уровней хуков по сравнению с JUnit — от метода до всего набора запусков, описанного в XML-файле (`testng.xml`):

- **`@Test`** — помечает тестовый метод. В отличие от JUnit, аннотация `@Test` в TestNG принимает множество параметров прямо внутри себя: `priority`, `dependsOnMethods`, `groups`, `enabled`, `timeOut`, `expectedExceptions`, `dataProvider` и другие.
- **`@BeforeMethod`** / **`@AfterMethod`** — выполняются перед/после каждого тестового метода (аналог `@BeforeEach`/`@AfterEach` в JUnit).
- **`@BeforeClass`** / **`@AfterClass`** — выполняются один раз перед/после всех тестовых методов текущего класса.
- **`@BeforeTest`** / **`@AfterTest`** — выполняются перед/после всех методов, относящихся к тегу `<test>` в `testng.xml` (уровень выше класса, но ниже suite — может объединять несколько классов).
- **`@BeforeSuite`** / **`@AfterSuite`** — выполняются один раз перед/после всего набора (suite), то есть перед/после выполнения всего XML-файла конфигурации, независимо от количества классов и тестов внутри.
- **`@BeforeGroups`** / **`@AfterGroups`** — выполняются перед/после первого/последнего метода в указанной группе (`groups = {"smoke"}`).
- **`@DataProvider`** — метод-поставщик данных для параметризации тестов (аналог `@MethodSource` в JUnit, см. отдельный вопрос).
- **`@Factory`** — метод, создающий экземпляры тестовых классов динамически (для более гибкой параметризации на уровне класса).

Ключевое отличие от JUnit 5 — иерархия шире (метод → класс → test-тег из XML → suite), а также TestNG не требует, чтобы `@BeforeClass`/`@AfterClass` были статическими методами (в отличие от `@BeforeAll`/`@AfterAll` в JUnit 5 по умолчанию), поскольку модель жизненного цикла экземпляра класса в TestNG отличается (по умолчанию один экземпляр класса на все его тестовые методы).

## Пример / когда применяется

```java
public class UserServiceTest {

    @BeforeSuite
    public void initSuite() {
        // разово перед всем прогоном: например, поднять тестовое окружение
    }

    @BeforeClass
    public void initClass() {
        // разово перед тестами этого класса: например, инициализация сервиса
    }

    @BeforeMethod
    public void initMethod() {
        // перед каждым тестом: например, создание тестовых данных
    }

    @Test(priority = 1, groups = "smoke")
    public void createUser_shouldSucceed() {
        // тест
    }

    @Test(priority = 2, dependsOnMethods = "createUser_shouldSucceed")
    public void deleteUser_shouldSucceed() {
        // тест, зависящий от предыдущего
    }

    @AfterMethod
    public void tearDownMethod() {
        // после каждого теста
    }

    @AfterClass
    public void tearDownClass() {
        // после всех тестов класса
    }

    @AfterSuite
    public void tearDownSuite() {
        // после всего прогона
    }
}
```

Порядок выполнения хуков: `@BeforeSuite` → `@BeforeTest` → `@BeforeClass` → `@BeforeMethod` → `@Test` → `@AfterMethod` → `@AfterClass` → `@AfterTest` → `@AfterSuite`.

## На что смотрит интервьюер

- Понимает ли кандидат полную иерархию хуков TestNG и её отличие от JUnit (в частности, уровень `@BeforeTest`/`@AfterTest`, привязанный к XML-конфигурации).
- Знает ли, что параметры вроде `priority`, `groups`, `dependsOnMethods` задаются прямо внутри `@Test`, а не отдельными аннотациями.
- Может ли объяснить, зачем нужен уровень suite (обычно для настройки окружения на весь прогон CI, включающий несколько классов/модулей).
- Частая ошибка — путать `@BeforeClass`/`@AfterClass` из TestNG с одноимёнными из JUnit 4 (в JUnit 4 они обязаны быть статическими, в TestNG — нет).
- Follow-up вопрос — как настраивается `testng.xml` для группировки тестов по suite/test и как это соотносится с параллельным запуском.
