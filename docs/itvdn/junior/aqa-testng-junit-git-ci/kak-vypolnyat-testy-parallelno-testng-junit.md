---
id: kak-vypolnyat-testy-parallelno-testng-junit
title: "Параллельный запуск тестов"
sidebar_position: 4
tags: ["AQA — TestNG/JUnit, Git, CI"]
---

# Как выполнять тесты параллельно TestNG/JUnit?

**Коротко:** TestNG поддерживает параллельный запуск "из коробки" через настройки `parallel` и `thread-count` в `testng.xml`, а JUnit 5 требует явного включения параллелизма через конфигурационные свойства (`junit.jupiter.execution.parallel.enabled`); в обоих случаях важно обеспечивать потокобезопасность и изоляцию состояния тестов.

## Развёрнутый ответ

Параллельный запуск тестов нужен для сокращения времени выполнения тестового набора, особенно когда тестов много и они независимы друг от друга (например, UI-тесты с реальным браузером).

**TestNG.** Параллелизм настраивается на уровне XML-файла `testng.xml` через атрибут `parallel`, который может принимать значения:
- `methods` — параллельно выполняются отдельные тестовые методы;
- `classes` — параллельно выполняются целые классы (методы внутри одного класса — последовательно);
- `tests` — параллельно выполняются блоки `<test>`;
- `instances` — параллельно выполняются экземпляры класса.

Дополнительно указывается `thread-count` — количество потоков в пуле. Для контроля параллелизма браузерных тестов часто используют `ThreadLocal<WebDriver>`, чтобы у каждого потока был свой независимый экземпляр драйвера.

**JUnit 5 (Jupiter).** Параллельное выполнение — экспериментальная, но стабильно используемая с версии 5.3+ возможность. Включается через файл `junit-platform.properties` в classpath:
```
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
```
Дополнительно можно настроить стратегию выделения потоков (`dynamic`, `fixed`, `custom`) и указывать уровень параллелизма (`@Execution(ExecutionMode.CONCURRENT)` на уровне класса или метода, либо `SAME_THREAD` для последовательных сценариев).

**JUnit 4** не имеет встроенной полноценной поддержки параллелизма на уровне методов "из коробки" в такой же гибкости — параллелизм там чаще реализуют либо через сборщик (например, параллельный запуск forked JVM в Maven Surefire/Gradle), либо через сторонние раннеры.

Ключевые нюансы, о которых важно помнить при параллельном запуске:
- Тесты должны быть независимы друг от друга — нельзя, чтобы один тест зависел от состояния, оставленного другим.
- Общие ресурсы (статические поля, singleton-объекты, WebDriver) должны быть либо потокобезопасными, либо созданы отдельно для каждого потока (`ThreadLocal`).
- Логирование и отчётность должны поддерживать многопоточность (например, Allure умеет корректно агрегировать результаты параллельных тестов).
- Параллелизм на уровне сборщика (Maven Surefire `forkCount`/`parallel`, Gradle `maxParallelForks`) — ещё один уровень, который можно комбинировать с параллелизмом самого фреймворка.

## Пример / когда применяется

`testng.xml` с параллельным запуском методов в 4 потока:

```xml
<suite name="RegressionSuite" parallel="methods" thread-count="4">
    <test name="SmokeTests">
        <classes>
            <class name="tests.LoginTest"/>
            <class name="tests.SearchTest"/>
        </classes>
    </test>
</suite>
```

Использование `ThreadLocal` для WebDriver при параллельном запуске:

```java
public class DriverFactory {
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    public static WebDriver getDriver() {
        if (driver.get() == null) {
            driver.set(new ChromeDriver());
        }
        return driver.get();
    }
}
```

`junit-platform.properties` для JUnit 5:

```
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.config.strategy=fixed
junit.jupiter.execution.parallel.config.fixed.parallelism=4
```

## На что смотрит интервьюер

Интервьюер проверяет, понимает ли кандидат разницу между параллелизмом на уровне фреймворка (`parallel="methods"` в TestNG, `junit.jupiter.execution.parallel.enabled` в JUnit) и параллелизмом на уровне сборщика (forked JVM в Maven/Gradle). Частая ошибка — включить параллельный запуск, не позаботившись о `ThreadLocal` для WebDriver, из-за чего тесты начинают "путать" сессии браузера и падать нестабильно (flaky-тесты). Хороший ответ включает упоминание изоляции состояния и потокобезопасности как обязательного условия для безопасного параллелизма.
