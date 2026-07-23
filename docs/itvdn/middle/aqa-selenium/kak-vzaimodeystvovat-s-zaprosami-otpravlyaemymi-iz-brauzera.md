---
id: kak-vzaimodeystvovat-s-zaprosami-otpravlyaemymi-iz-brauzera
title: "Перехват сетевых запросов из браузера"
sidebar_position: 8
tags: ["AQA — Selenium"]
---

# Как взаимодействовать с запросами, отправляемыми из браузера?

**Коротко:** классический Selenium WebDriver API не даёт прямого доступа к сетевым запросам, но начиная с Selenium 4 появилась поддержка Chrome DevTools Protocol (BiDi/CDP), позволяющая перехватывать, инспектировать и модифицировать HTTP-запросы и ответы напрямую из теста; альтернативные подходы — прокси-инструменты (BrowserMob Proxy, mitmproxy) или анализ через `performance` логи браузера.

## Развёрнутый ответ

По умолчанию WebDriver API сфокусирован на взаимодействии с DOM и не предоставляет методов вроде «получить все сетевые запросы страницы». Однако есть несколько способов решить эту задачу:

1. **Selenium 4 + DevTools Protocol (CDP).** Начиная с Selenium 4, для Chromium-based браузеров доступен класс `DevTools`, который даёт прямой доступ к Chrome DevTools Protocol. Через него можно:
   - включить домен `Network` и слушать события `Network.requestWillBeSent`, `Network.responseReceived`;
   - перехватывать и модифицировать запросы (`Network.setRequestInterception` / Fetch domain), например подменять заголовки, симулировать медленную сеть, блокировать конкретные ресурсы (аналитику, рекламу);
   - эмулировать offline-режим или ограничение по скорости сети (throttling).

2. **W3C WebDriver BiDi (BiDirectional protocol).** Более новый, кроссбраузерный стандарт (в разработке/частично поддерживается), заменяющий проприетарный CDP единым протоколом для событийного взаимодействия, включая перехват сетевых запросов, независимо от вендора браузера.

3. **Внешний прокси-сервер (BrowserMob Proxy, mitmproxy, Fiddler).** Классический подход до Selenium 4: браузер запускается с capability, указывающей на прокси-сервер (`--proxy-server=host:port`). Весь трафик браузера проходит через прокси, который логирует, модифицирует или блокирует запросы. Тест обращается к API прокси для получения записанного трафика (HAR-файлы).

4. **Логи производительности браузера (`performance` log type).** Chrome позволяет включить сбор performance-логов через capability `goog:loggingPrefs`, а затем получать их через `driver.manage().logs().get("performance")` — это набор low-level событий CDP в текстовом виде, требующий парсинга JSON.

Практическое применение перехвата запросов: проверка, что при клике на кнопку отправляется правильный API-запрос с нужными параметрами; проверка кодов ответа и содержимого; мокирование бэкенда для изоляции UI-тестов от нестабильного API; проверка отправки аналитических событий (Google Analytics, Mixpanel).

## Пример / когда применяется

```java
ChromeDriver driver = new ChromeDriver();
DevTools devTools = driver.getDevTools();
devTools.createSession();

devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));

devTools.addListener(Network.responseReceived(), response -> {
    String url = response.getResponse().getUrl();
    int status = response.getResponse().getStatus();
    if (url.contains("/api/login")) {
        System.out.println("Статус ответа логина: " + status);
    }
});

driver.get("https://example.com/login");
```

Пример блокировки внешних ресурсов (ускорение и изоляция тестов):

```java
devTools.send(Network.setBlockedURLs(List.of("*analytics*", "*ads*")));
```

## На что смотрит интервьюер

- Знание, что «из коробки» WebDriver API не даёт доступа к сетевым запросам, и понимание, какие есть альтернативы.
- Знание про интеграцию Selenium 4 с CDP через `DevTools` API — это ожидаемый современный ответ.
- Знание альтернативных подходов (BrowserMob Proxy, performance logs) для случаев, когда CDP недоступен (например, Safari, Firefox без BiDi).
- Follow-up: чем WebDriver BiDi отличается от CDP, как замокать ответ API через `Fetch.enable`/`Fetch.fulfillRequest`, как перехватывать запросы для проверки аналитики.
- Красный флаг: утверждение, что Selenium «изначально» умеет читать сетевые запросы без дополнительных инструментов или CDP.
