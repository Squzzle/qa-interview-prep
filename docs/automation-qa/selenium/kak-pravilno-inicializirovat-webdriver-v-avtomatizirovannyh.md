---
id: kak-pravilno-inicializirovat-webdriver-v-avtomatizirovannyh
title: "Инициализация WebDriver в тестах"
sidebar_position: 1
tags: ["Инициализация браузера и Selenium"]
---

# Как правильно инициализировать WebDriver в автоматизированных тестах?

**Коротко:** WebDriver создаётся один раз перед тестом (или набором тестов) через конструктор конкретного драйвера с заранее настроенными Options/Capabilities, а после выполнения обязательно закрывается через `quit()`, чтобы не оставлять висящие процессы браузера.

## Развёрнутый ответ

Инициализация WebDriver — это создание экземпляра объекта, реализующего интерфейс `WebDriver` (например, `ChromeDriver`, `FirefoxDriver`, `RemoteWebDriver`). Правильная инициализация включает несколько ключевых моментов.

Во-первых, нужно убедиться, что бинарник драйвера (`chromedriver`, `geckodriver`) доступен и совместим по версии с установленным браузером — либо через системный `PATH`, либо через `System.setProperty` (в Java), либо, что современно и правильно, через `Selenium Manager` (встроен в Selenium 4+) или сторонний `WebDriverManager`, которые автоматически подбирают и скачивают нужную версию драйвера.

Во-вторых, перед созданием драйвера конфигурируются `Options` (`ChromeOptions`, `FirefoxOptions`) — задаются аргументы запуска (headless-режим, размер окна, отключение уведомлений, прокси, user-agent и т.д.), которые передаются в конструктор драйвера.

В-третьих, инициализация должна происходить в методе жизненного цикла тестового фреймворка — обычно в `@BeforeEach`/`@BeforeMethod` (для JUnit/TestNG) или в фикстуре (pytest), а закрытие драйвера — в `@AfterEach`/`@AfterMethod` через `driver.quit()`. Важно использовать именно `quit()`, а не `close()`: `close()` закрывает только текущую вкладку/окно, а `quit()` завершает всю сессию драйвера и убивает процесс браузера, освобождая ресурсы.

Дополнительно правильная инициализация подразумевает:
- Изоляцию тестов — каждый тест или каждый класс тестов получает свой экземпляр драйвера (если не используется намеренно паттерн разделяемого драйвера ради скорости).
- Обработку исключений при старте (например, `SessionNotCreatedException` при несовпадении версий), чтобы падение при инициализации не оставляло "зомби"-процессы.
- Использование `try/finally` или встроенных механизмов фреймворка, чтобы драйвер закрывался даже при падении теста.
- Настройку неявных/явных ожиданий сразу после создания драйвера, если они применяются глобально.

## Пример / когда применяется

Пример на Java с JUnit 5 и Selenium 4 (Selenium Manager сам подбирает драйвер):

```java
public class BaseTest {
    protected WebDriver driver;

    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        driver = new ChromeDriver(options);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
```

Пример на Python:

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pytest

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--start-maximized")
    drv = webdriver.Chrome(options=options)
    yield drv
    drv.quit()
```

## На что смотрит интервьюер

- Знает ли кандидат разницу между `close()` и `quit()` — типичная ошибка, когда драйвер "не закрывается" и накапливаются процессы.
- Понимание, что инициализация должна быть в setup-методе, а не в каждом тесте вручную.
- Осведомлённость о Selenium Manager / WebDriverManager как о решении проблемы версий драйверов.
- Обработка ошибок инициализации и гарантированное закрытие драйвера (try/finally, tearDown).
- Понимание, что жёстко зашитые пути к драйверу — плохая практика (непереносимость между машинами/CI).
