---
id: mozhete-li-vy-nazvat-10-interfeysov-v-selenium
title: "10 интерфейсов в Selenium"
sidebar_position: 13
tags: ["AQA — Selenium"]
---

# Можете ли вы назвать 10 интерфейсов в Selenium?

**Коротко:** Selenium WebDriver построен вокруг набора интерфейсов, определяющих контракт поведения — `WebDriver`, `WebElement`, `SearchContext`, `JavascriptExecutor`, `TakesScreenshot`, `Navigation`, `Options`, `Timeouts`, `Cookie`-related `Alert`, `Wait<T>`, `Capabilities`, `Interactive` и другие, — которые реализуются классами вроде `ChromeDriver`, `FirefoxDriver`.

## Развёрнутый ответ

Selenium WebDriver спроектирован по принципу программирования на основе интерфейсов: клиентский код работает с абстракциями, а конкретная реализация (Chrome, Firefox, Edge и т.д.) подставляется через классы-драйверы. Это даёт кросс-браузерность и гибкость — тесты пишутся против интерфейса `WebDriver`, а не против конкретного браузера.

Основные интерфейсы:

1. **`WebDriver`** — центральный интерфейс, описывающий базовые операции с браузером: открытие страниц, поиск элементов, управление окнами.
2. **`WebElement`** — представляет элемент DOM и операции над ним: клик, ввод текста, получение атрибутов.
3. **`SearchContext`** — родительский интерфейс для `WebDriver` и `WebElement`, объявляет методы `findElement`/`findElements`.
4. **`JavascriptExecutor`** — позволяет выполнять произвольный JavaScript в контексте браузера.
5. **`TakesScreenshot`** — предоставляет метод для создания скриншотов страницы.
6. **`WebDriver.Navigation`** — вложенный интерфейс для навигации: `back()`, `forward()`, `refresh()`, `to()`.
7. **`WebDriver.Options`** — управление cookies, таймаутами, окнами (`manage()`).
8. **`WebDriver.Timeouts`** — настройка implicit wait, page load timeout, script timeout.
9. **`WebDriver.Window`** — управление размером и позицией окна браузера.
10. **`Alert`** — работа с JavaScript-алертами (accept, dismiss, getText, sendKeys).
11. **`Wait<T>`** (реализуется `WebDriverWait`, `FluentWait`) — механизм явных ожиданий.
12. **`Capabilities`/`MutableCapabilities`** — описывают возможности и настройки браузера/драйвера.
13. **`Interactive`** — поддержка сложных действий через Actions API (используется вместе с `Actions`).
14. **`HasInputDevices`** (устаревший) и **`Locatable`** — расширенные возможности взаимодействия и позиционирования элементов.

## Пример / когда применяется

```java
WebDriver driver = new ChromeDriver(); // ChromeDriver реализует WebDriver

// JavascriptExecutor
JavascriptExecutor js = (JavascriptExecutor) driver;
js.executeScript("window.scrollBy(0,500)");

// TakesScreenshot
File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);

// Navigation
driver.navigate().back();
driver.navigate().refresh();

// Options / Timeouts
driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
driver.manage().window().maximize();

// Alert
Alert alert = driver.switchTo().alert();
alert.accept();

// Wait<T>
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("submit")));
```

Знание этих интерфейсов применяется при кастинге драйвера для доступа к дополнительным возможностям (например, `(JavascriptExecutor) driver`), при написании кастомных wrapper-классов и при выборе правильного API для конкретной задачи (скриншот, алерт, навигация).

## На что смотрит интервьюер

Интервьюер проверяет, понимает ли кандидат архитектуру Selenium как набор интерфейсов, а не просто помнит список методов класса `ChromeDriver`. Хороший ответ показывает понимание, зачем нужен каст типа `(JavascriptExecutor) driver` — потому что `ChromeDriver` реализует несколько интерфейсов одновременно. Частая ошибка — путать `WebDriver` с конкретной реализацией или не знать про `SearchContext` как общего родителя `WebDriver` и `WebElement`. Могут задать follow-up: "какие классы реализуют эти интерфейсы?" или "почему в Selenium используется подход interface-driven design, а не просто конкретные классы браузеров?".
