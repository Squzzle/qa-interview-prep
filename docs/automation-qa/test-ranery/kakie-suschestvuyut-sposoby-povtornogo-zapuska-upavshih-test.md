---
id: kakie-suschestvuyut-sposoby-povtornogo-zapuska-upavshih-test
title: "Повторный запуск упавших тестов"
sidebar_position: 11
tags: ["Тест-раннеры"]
---

# Какие существуют способы повторного запуска упавших тестов (re-run failed tests) в JUnit 5 и TestNG?

**Коротко:** в TestNG есть встроенный механизм через интерфейс `IRetryAnalyzer` и генерируемый по итогам прогона файл `testng-failed.xml`; в JUnit 5 встроенного retry нет — используются сторонние расширения (например, `junit5-retry`, кастомные `TestExecutionExceptionHandler`/`Extension`) либо перезапуск набора упавших тестов средствами системы сборки/CI по отчёту Surefire/Failsafe.

## Развёрнутый ответ

**В TestNG:**

- **`IRetryAnalyzer`** — интерфейс с методом `retry(ITestResult result)`, который реализуется кастомным классом; в нём описывается логика, сколько раз и при каких условиях повторно запускать упавший тест. Подключается к тесту через атрибут `@Test(retryAnalyzer = MyRetryAnalyzer.class)`, либо глобально — через `IAnnotationTransformer`, который назначает retry-анализатор всем тестам сразу (без необходимости прописывать его в каждой аннотации `@Test`).
- **`testng-failed.xml`** — TestNG автоматически генерирует этот файл после прогона в папке `test-output`, содержащий только упавшие тесты. Его можно запустить отдельно, чтобы перепрогнать исключительно неудавшиеся тесты, не трогая остальные.
- Retry обычно комбинируют с ограничением количества повторов (например, не более 2-3 раз), чтобы не маскировать по-настоящему сломанный функционал бесконечными перезапусками, и с логированием факта retry для отслеживания "флакующих" тестов.

**В JUnit 5:**

- Встроенного механизма retry в стандартном JUnit 5 (Jupiter) нет.
- Используются сторонние расширения, реализующие `TestExecutionExceptionHandler` или `InvocationInterceptor` из Extension API JUnit 5 — например, широко используемая библиотека `junit5-retry` (аннотация `@Retry(maxRetries = 3)`), либо кастомные реализации на основе `TestTemplateInvocationContextProvider`.
- Альтернативный подход — обработка на уровне CI/системы сборки: Maven Surefire/Failsafe плагин имеет параметр `rerunFailingTestsCount`, который заставляет Maven автоматически перезапускать упавшие тесты указанное число раз при выполнении `mvn test`, независимо от используемого раннера (работает как для JUnit, так и для TestNG).
- Gradle также поддерживает retry через плагин `test-retry-gradle-plugin`.

**Общий принцип для обоих фреймворков:** retry — это инструмент для борьбы с нестабильностью инфраструктуры (флакующие тесты из-за таймингов, сети, race condition в UI), а не способ "прятать" реальные баги. Хорошая практика — логировать факт срабатывания retry и заводить отдельные задачи на исправление первопричины нестабильности, а не полагаться на повторные попытки как постоянное решение.

## Пример / когда применяется

Пример `IRetryAnalyzer` в TestNG:

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int count = 0;
    private static final int MAX_RETRY = 2;

    @Override
    public boolean retry(ITestResult result) {
        if (count < MAX_RETRY) {
            count++;
            return true;
        }
        return false;
    }
}
```

```java
@Test(retryAnalyzer = RetryAnalyzer.class)
public void flakyUiTest() {
    // тест, подверженный нестабильности из-за таймингов UI
}
```

Настройка retry для Maven Surefire (работает независимо от фреймворка):

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <rerunFailingTestsCount>2</rerunFailingTestsCount>
    </configuration>
</plugin>
```

## На что смотрит интервьюер

- Знает ли кандидат, что в JUnit 5 нет встроенного retry "из коробки" в отличие от TestNG — частый вопрос на понимание различий фреймворков.
- Может ли назвать конкретный механизм TestNG (`IRetryAnalyzer`, `testng-failed.xml`), а не общими словами сказать "просто перезапустить".
- Понимает ли риски злоупотребления retry — маскировка реальных багов и нестабильной архитектуры тестов вместо их исправления.
- Частая ошибка — путать retry на уровне теста (IRetryAnalyzer) с перезапуском всего прогона вручную.
- Follow-up вопрос — как отличить "легитимный" флакующий тест (сетевые тайминги) от теста, который систематически ловит реальный баг под нагрузкой, и как мониторить частоту срабатывания retry в отчётах CI.
