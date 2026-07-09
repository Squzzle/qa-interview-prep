---
id: kak-s-pomoschyu-allure-prikrepit-skrinshot-k-otchetu
title: "Прикрепление скриншота к отчёту Allure"
sidebar_position: 4
tags: ["Логгеры и репортеры"]
---

# Как с помощью Allure прикрепить скриншот к отчету при падении теста?

**Коротко:** Скриншот прикрепляется через метод, помеченный аннотацией `@Attachment`, который возвращает `byte[]` со снимком экрана; вызывается он либо вручную в момент падения, либо автоматически через слушателя (listener) тест-фреймворка при статусе FAILED.

## Развёрнутый ответ

Allure прикрепляет вложения через механизм `@Attachment` — метод помечается этой аннотацией, а возвращаемое значение (обычно `byte[]` для бинарных данных вроде изображений, или `String` для текста) автоматически становится вложением в отчёте. Тип содержимого указывается атрибутом `type` (MIME-тип, например `image/png`), а имя вложения — атрибутом `value`.

Ручной способ (программный API `Allure.addAttachment`) также доступен через класс `io.qameta.allure.Allure`, что удобнее, если не хочется создавать отдельный метод с аннотацией.

Ключевой вопрос — **когда** делать скриншот. Есть два подхода:

1. **Явный вызов в теле теста** — вызывать метод скриншота в блоке `catch` или в конце теста при провале ассерта. Минус — нужно вручную добавлять в каждый тест.
2. **Автоматический через слушателя (listener)** — реализовать `ITestListener` (TestNG) или `TestWatcher`/расширение (JUnit5), которое перехватывает событие падения теста (`onTestFailure`) и делает скриншот автоматически для всех тестов без дублирования кода. Это предпочтительный подход в реальных проектах, так как исключает человеческий фактор (забыли добавить скриншот в новый тест).

Для веб-тестов скриншот делается через `TakesScreenshot` в Selenium WebDriver. Для мобильных — через `AppiumDriver`. Для API-тестов вместо скриншота обычно прикрепляют тело запроса/ответа как текстовое вложение.

Важные нюансы:

- Скриншот нужно делать **до** закрытия драйвера (`driver.quit()`), иначе сессия уже недоступна.
- При параллельном запуске тестов драйвер должен быть ThreadLocal, чтобы слушатель получил доступ к драйверу именно того потока, где упал тест.
- Помимо скриншота полезно одновременно прикреплять page source (HTML) и логи браузера для полной диагностики.

## Пример / когда применяется

Ручной способ через `@Attachment`:

```java
@Attachment(value = "Скриншот при падении", type = "image/png")
public byte[] saveScreenshot(WebDriver driver) {
    return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
}

@Test
void shouldDisplayErrorMessage() {
    try {
        loginPage.submitInvalidCredentials();
        assertThat(loginPage.getErrorMessage()).isEqualTo("Неверный логин или пароль");
    } catch (AssertionError e) {
        saveScreenshot(driver);
        throw e;
    }
}
```

Автоматический способ через TestNG `ITestListener`:

```java
public class ScreenshotListener implements ITestListener {

    @Override
    public void onTestFailure(ITestResult result) {
        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            Allure.addAttachment("Скриншот при падении: " + result.getName(),
                    new ByteArrayInputStream(screenshot));
        }
    }
}
```

Подключение слушателя:

```java
@Listeners(ScreenshotListener.class)
public class LoginTest {
    // тесты
}
```

## На что смотрит интервьюер

- Знает ли кандидат оба подхода — ручной и через listener — и может объяснить, почему автоматический предпочтительнее в реальных проектах.
- Понимает ли, что нужно делать скриншот до закрытия драйвера/сессии.
- Знает ли про ThreadLocal-драйвер при параллельном запуске — частая ошибка, когда листенер обращается не к тому драйверу.
- Красный флаг — если кандидат утверждает, что скриншот прикрепляется "сам по себе" без явного вызова кода, или не знает про `@Attachment`/`Allure.addAttachment`.
- Follow-up: как прикрепить скриншот в JUnit5 (через `TestWatcher` или расширение `AfterTestExecutionCallback`), как прикрепить видео записи прогона, как избежать дублирования скриншотов при retry упавших тестов.
