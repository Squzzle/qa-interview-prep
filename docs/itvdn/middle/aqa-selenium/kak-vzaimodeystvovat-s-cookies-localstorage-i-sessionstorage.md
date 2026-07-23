---
id: kak-vzaimodeystvovat-s-cookies-localstorage-i-sessionstorage
title: "Работа с cookies, LocalStorage, SessionStorage"
sidebar_position: 9
tags: ["AQA — Selenium"]
---

# Как взаимодействовать с cookies, LocalStorage и SessionStorage?

**Коротко:** cookies управляются через встроенный API `driver.manage()` (`getCookies`, `addCookie`, `deleteCookie`), а LocalStorage и SessionStorage — через выполнение JavaScript-кода методом `driver.executeScript(...)`, так как WebDriver не предоставляет для них отдельного нативного API.

## Развёрнутый ответ

Все три механизма служат для хранения данных на стороне клиента, но имеют разное назначение и разный способ работы с ними в Selenium.

**Cookies.** Selenium предоставляет нативный API через интерфейс `Options` (`driver.manage()`):
- `driver.manage().getCookies()` — получить все cookies текущего домена в виде `Set<Cookie>`;
- `driver.manage().getCookieNamed(name)` — получить конкретную cookie по имени;
- `driver.manage().addCookie(new Cookie("name", "value"))` — добавить cookie (важно: домен должен совпадать с текущим открытым сайтом, иначе будет ошибка — нельзя добавить cookie для домена, на котором браузер сейчас не находится);
- `driver.manage().deleteCookieNamed(name)` / `deleteAllCookies()` — удалить cookies.

Практическое применение: пропуск логина через UI — можно один раз залогиниться, сохранить cookie сессии, а в последующих тестах сразу подставлять её через `addCookie`, минуя форму логина и ускоряя тесты.

**LocalStorage и SessionStorage.** В отличие от cookies, WebDriver API (даже в W3C-спецификации) не имеет отдельных методов для Web Storage. Единственный штатный способ — выполнение JavaScript через `JavascriptExecutor`:

```java
JavascriptExecutor js = (JavascriptExecutor) driver;

// LocalStorage
js.executeScript("window.localStorage.setItem(arguments[0], arguments[1]);", "token", "abc123");
Object value = js.executeScript("return window.localStorage.getItem(arguments[0]);", "token");
js.executeScript("window.localStorage.removeItem(arguments[0]);", "token");
js.executeScript("window.localStorage.clear();");

// SessionStorage работает аналогично, через window.sessionStorage
js.executeScript("window.sessionStorage.setItem(arguments[0], arguments[1]);", "key", "value");
```

Ключевые отличия хранилищ, важные для тестировщика:
- **Cookies** отправляются на сервер с каждым HTTP-запросом (если не установлен флаг `HttpOnly`/domain restrictions), доступны как клиенту, так и серверу, имеют ограничение по размеру (~4KB) и опциональный срок жизни (`expiry`).
- **LocalStorage** хранится только на клиенте, не отправляется на сервер автоматически, не имеет срока жизни (данные сохраняются до явного удаления или очистки браузера), общий объём — обычно 5-10MB.
- **SessionStorage** аналогичен LocalStorage по API, но данные живут только в рамках одной вкладки/сессии браузера и удаляются при её закрытии.

Важный нюанс безопасности: cookie с флагом `HttpOnly` недоступна через JavaScript (`document.cookie`), но всё равно видна через `driver.manage().getCookies()`, так как Selenium получает её напрямую от браузера, а не через JS-скрипт — это полезно знать при тестировании защищённых сессионных cookies.

## Пример / когда применяется

Пример быстрой авторизации через подстановку cookie сессии:

```java
driver.get("https://example.com"); // нужно открыть домен перед добавлением cookie
Cookie sessionCookie = new Cookie("session_id", "abc123xyz");
driver.manage().addCookie(sessionCookie);
driver.navigate().refresh(); // применяем cookie, обновляя страницу
```

Пример проверки, что после логина в LocalStorage записан JWT-токен:

```java
Object token = ((JavascriptExecutor) driver)
    .executeScript("return window.localStorage.getItem('jwt_token');");
Assert.assertNotNull(token, "JWT токен должен быть сохранён после логина");
```

## На что смотрит интервьюер

- Знание нативного Selenium API для cookies и понимание, что для Web Storage нативного API нет.
- Умение написать корректный JS через `JavascriptExecutor` для чтения/записи LocalStorage/SessionStorage.
- Понимание разницы между тремя хранилищами: срок жизни, объём, отправка на сервер.
- Знание нюанса с `HttpOnly` cookie и доступностью через `document.cookie` vs `driver.manage()`.
- Follow-up: как ускорить прогрев тестов через подстановку токена в LocalStorage вместо прохождения формы логина; ограничения при работе с cookie кросс-доменно.
- Красный флаг: попытка получить LocalStorage через несуществующий метод `driver.manage().getLocalStorage()` — такого API в Selenium нет.
