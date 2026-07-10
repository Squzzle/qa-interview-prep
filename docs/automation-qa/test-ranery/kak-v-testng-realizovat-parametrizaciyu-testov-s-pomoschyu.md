---
id: kak-v-testng-realizovat-parametrizaciyu-testov-s-pomoschyu
title: "Параметризация тестов через DataProvider"
sidebar_position: 8
tags: ["Тест-раннеры"]
---

# Как в TestNG реализовать параметризацию тестов с помощью `@DataProvider`?

**Коротко:** `@DataProvider` — это аннотация над методом, возвращающим двумерный массив объектов (`Object[][]`), который TestNG использует как источник наборов аргументов для тестового метода, помеченного `@Test(dataProvider = "имя")`, запуская тест по разу на каждую строку массива.

## Развёрнутый ответ

`@DataProvider` — основной механизм параметризации в TestNG, более гибкий по сравнению с простыми аннотациями JUnit (`@ValueSource`), поскольку позволяет передавать произвольные объекты, а не только примитивы.

Правила работы `@DataProvider`:

- Метод-провайдер помечается аннотацией `@DataProvider(name = "имяПровайдера")`.
- Возвращаемый тип — `Object[][]` (каждая строка — набор аргументов для одного запуска теста) либо `Iterator<Object[]>` (для больших/потоковых наборов данных, без построения всего массива в памяти).
- Тестовый метод, использующий этот источник, указывает имя провайдера: `@Test(dataProvider = "имяПровайдера")`.
- Параметры тестового метода должны по количеству и типам соответствовать элементам внутреннего массива `Object[]`.
- Провайдер может находиться как в том же классе, так и в отдельном классе — тогда указывается `dataProviderClass = SomeClass.class`.
- `@DataProvider` может принимать параметр `ITestContext` для доступа к контексту запуска (например, для получения параметров окружения из `testng.xml`).
- Есть параметр `parallel = true` у `@DataProvider`, позволяющий запускать разные наборы данных параллельно в разных потоках.

По сравнению с `@MethodSource` в JUnit 5 подход концептуально похож, но в TestNG параметризация была встроена в фреймворк изначально и глубже интегрирована с остальными механизмами (группами, зависимостями).

## Пример / когда применяется

```java
public class LoginTest {

    @DataProvider(name = "loginData")
    public Object[][] provideLoginData() {
        return new Object[][] {
            {"ivan@example.com", "correctPassword", true},
            {"ivan@example.com", "wrongPassword", false},
            {"", "correctPassword", false},
            {"unknown@example.com", "correctPassword", false}
        };
    }

    @Test(dataProvider = "loginData")
    public void loginTest(String email, String password, boolean expectedResult) {
        boolean actualResult = authService.login(email, password);
        Assert.assertEquals(actualResult, expectedResult);
    }
}
```

Пример с внешним классом-провайдером и параллельным запуском наборов данных:

```java
@Test(dataProvider = "userData", dataProviderClass = UserDataProviders.class)
public void createUserTest(String name, int age) {
    // логика теста
}
```

Такой подход применяется, когда нужно проверить один сценарий (например, авторизацию, валидацию формы, расчёт цены) на множестве комбинаций входных данных, включая сложные объекты, а не только строки/числа.

## На что смотрит интервьюер

- Знает ли кандидат обязательный формат возврата — `Object[][]` (или `Iterator<Object[]>`).
- Понимает ли, как связать провайдер с тестом через `dataProvider = "..."` и (при необходимости) `dataProviderClass`.
- Может ли объяснить преимущество `@DataProvider` перед JUnit-подходом — гибкость передачи сложных объектов, встроенная поддержка параллелизма.
- Частая ошибка — несоответствие количества/типов параметров тестового метода элементам массива данных, что приводит к `TestNGException` на этапе запуска.
- Follow-up вопрос — как использовать `Iterator<Object[]>` вместо массива для экономии памяти при больших наборах данных, и как включить `parallel = true` для ускорения прогона.
