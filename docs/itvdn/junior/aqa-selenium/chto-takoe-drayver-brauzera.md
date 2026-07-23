---
id: chto-takoe-drayver-brauzera
title: "Что такое драйвер браузера"
sidebar_position: 2
tags: ["AQA — Selenium"]
---

# Что такое драйвер браузера?

**Коротко:** драйвер браузера — это исполняемый файл, выступающий посредником между кодом теста (Selenium WebDriver) и конкретным браузером: он принимает команды по протоколу WebDriver и транслирует их в нативные действия браузера.

## Развёрнутый ответ

Каждый браузер имеет собственную внутреннюю архитектуру, и напрямую управлять им из внешнего кода невозможно. Драйвер браузера — это отдельный бинарный процесс, который запускается локально (или удалённо, например в контейнере/Grid), принимает HTTP-запросы от клиентской библиотеки Selenium в формате протокола WebDriver (JSON Wire Protocol в старых версиях, W3C WebDriver Protocol — в актуальных) и выполняет соответствующие действия через внутренние API браузера.

Схема взаимодействия выглядит так:

1. Тест вызывает метод, например `driver.findElement(By.id("login")).click()`.
2. Клиентская библиотека Selenium сериализует это в HTTP-запрос к локальному серверу драйвера (обычно `localhost:PORT`).
3. Драйвер браузера получает запрос, транслирует его в команды, понятные конкретному браузеру (через встроенные debugging-протоколы, например Chrome DevTools Protocol для Chrome).
4. Браузер выполняет действие, результат возвращается обратно тем же путём.

Для каждого браузера существует свой драйвер:

- **ChromeDriver** — для Google Chrome и Chromium-based браузеров.
- **GeckoDriver** — для Mozilla Firefox.
- **EdgeDriver (msedgedriver)** — для Microsoft Edge.
- **SafariDriver** — встроен в macOS для Safari.
- **InternetExplorerDriver** — для устаревшего Internet Explorer.

Важный нюанс: версия драйвера должна быть совместима с версией установленного браузера, иначе тесты могут падать с ошибками `SessionNotCreatedException`. Начиная с Selenium 4, появился **Selenium Manager** — встроенный инструмент, который автоматически подбирает и скачивает нужную версию драйвера, избавляя от ручного управления (раньше для этого использовали сторонние библиотеки, например WebDriverManager от Bonigarcia).

Драйвер обычно нужно указать в переменной окружения или передать путь к исполняемому файлу явно при инициализации `WebDriver`.

## Пример / когда применяется

Инициализация драйвера для Chrome на Java (Selenium 4+, с автоматическим управлением через Selenium Manager):

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class DriverSetup {
    public static void main(String[] args) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");

        // Selenium 4 сам найдёт/скачает подходящий ChromeDriver
        WebDriver driver = new ChromeDriver(options);

        driver.get("https://example.com");
        driver.quit();
    }
}
```

Ручное указание пути к драйверу (актуально для старых версий или при отсутствии интернета для авто-загрузки):

```java
System.setProperty("webdriver.chrome.driver", "/usr/local/bin/chromedriver");
WebDriver driver = new ChromeDriver();
```

## На что смотрит интервьюер

- Понимает ли кандидат, что драйвер — это отдельный процесс/бинарник, а не часть библиотеки Selenium.
- Знает ли о совместимости версий драйвера и браузера как частой причине падения тестов.
- В курсе ли про Selenium Manager (Selenium 4) как современный способ управления драйверами.
- Может объяснить упрощённо схему запрос-ответ через протокол WebDriver.
- Красный флаг: путает драйвер браузера с самим браузером или с классом `WebDriver` (интерфейсом в коде теста) — это разные вещи: `WebDriver` — интерфейс в клиентском коде, драйвер браузера — внешний процесс.
